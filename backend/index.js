const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const {
  initDatabase, createSession, getSessions, getSessionById,
  updateSessionStatus, getAgents, getWebhookLogs,
} = require('./models/database');
const { allocateAgent, releaseAgent } = require('./services/allocation');
const { fireWebhook } = require('./services/webhook');
const { createVideoRoom, endVideoRoom } = require('./services/adapters/videoAdapter');
const { enqueueKYCRequest } = require('./services/queue');
const { startWorker } = require('./services/worker');
const { publishStatusEvent } = require('./services/notifier');
const { uploadDocument, getPresignedUrl } = require('./services/storage');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: '*/*', limit: '10mb' }));

app.post('/api/kyc/request', async (req, res) => {
  const { customer_name, customer_email, document_type, language, webhook_url } = req.body;
  try {
    const sessionId = crypto.randomUUID();
    const room = await createVideoRoom(sessionId);
    const agent = await allocateAgent(language, document_type);
    const status = agent ? 'assigned' : 'queued';
    await createSession({
      id: sessionId, customer_name, customer_email, document_type,
      language, status, agent_id: agent?.id || null, webhook_url: webhook_url || null,
    });
    if (status === 'queued') {
      await enqueueKYCRequest(sessionId, { customer_name, language, document_type });
    }
    await publishStatusEvent(sessionId, status, { customer_name, agent_id: agent?.id || null });
    await fireWebhook(sessionId, `kyc.${status}`, { session_id: sessionId, customer_name, agent: agent || null, room }, webhook_url);
    res.json({ session_id: sessionId, status, agent, room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/kyc/:id/status', async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;
  try {
    const session = await getSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    await updateSessionStatus(id, status);
    if ((status === 'completed' || status === 'cancelled') && session.agent_id) {
      await releaseAgent(session.agent_id);
      if (status === 'completed') await endVideoRoom(`room-${id}`);
    }
    await publishStatusEvent(id, status, { agent_id: session.agent_id });
    await fireWebhook(id, `kyc.${status}`, { session_id: id, status }, session.webhook_url);
    res.json({ success: true, status });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/kyc/:id/upload', async (req, res) => {
  const { id } = req.params;
  const fileName = req.headers['x-file-name'] || `doc-${Date.now()}.pdf`;
  const mimeType = req.headers['content-type'] || 'application/octet-stream';
  try {
    const session = await getSessionById(id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    const key = await uploadDocument(id, fileName, req.body, mimeType);
    const url = await getPresignedUrl(key);
    res.json({ key, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/kyc', async (req, res) => {
  try { res.json(await getSessions()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/agents', async (req, res) => {
  try { res.json(await getAgents()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/webhooks', async (req, res) => {
  try { res.json(await getWebhookLogs()); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = 3001;
app.listen(PORT, async () => {
  await initDatabase();
  startWorker();
  console.log(`Backend running on http://localhost:${PORT}`);
});

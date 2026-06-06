const { logWebhook } = require('../models/database');

async function fireWebhook(sessionId, eventType, payload, webhookUrl) {
  let statusCode = null;
  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: eventType, ...payload }),
      });
      statusCode = response.status;
    } catch (err) {
      console.error('Webhook delivery failed:', err.message);
      statusCode = 0;
    }
  }
  await logWebhook({ session_id: sessionId, event_type: eventType, payload, status_code: statusCode });
}

module.exports = { fireWebhook };

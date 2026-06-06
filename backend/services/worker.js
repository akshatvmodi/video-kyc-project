const { pollQueue, deleteMessage } = require("./queue");
const { allocateAgent } = require("./allocation");
const { getSessionById, updateSessionStatus } = require("../models/database");

async function processQueue() {
  const messages = await pollQueue();

  for (const message of messages) {
    try {
      const { sessionId, language, document_type } = JSON.parse(message.Body);
      const session = await getSessionById(sessionId);

      if (!session || session.status !== "queued") {
        await deleteMessage(message.ReceiptHandle);
        continue;
      }

      const agent = await allocateAgent(language, document_type);
      if (agent) {
        await updateSessionStatus(sessionId, "assigned");
        console.log(`Assigned agent ${agent.name} to session ${sessionId}`);
      } else {
        console.log(`No agent available for session ${sessionId}, will retry`);
      }

      await deleteMessage(message.ReceiptHandle);
    } catch (err) {
      console.error("Worker error:", err.message);
    }
  }
}

function startWorker() {
  console.log("SQS worker started...");
  setInterval(processQueue, 6000);
}

module.exports = { startWorker };

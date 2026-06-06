const { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } = require("@aws-sdk/client-sqs");

const sqs = new SQSClient({ region: "ap-south-1" });
const QUEUE_URL = "https://sqs.ap-south-1.amazonaws.com/469510588722/kyc-requests";

async function enqueueKYCRequest(sessionId, data) {
  await sqs.send(new SendMessageCommand({
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify({ sessionId, ...data }),
    MessageAttributes: {
      language: { DataType: "String", StringValue: data.language || "English" },
      document_type: { DataType: "String", StringValue: data.document_type || "basic" },
    },
  }));
  console.log(`Enqueued KYC request: ${sessionId}`);
}

async function pollQueue() {
  const result = await sqs.send(new ReceiveMessageCommand({
    QueueUrl: QUEUE_URL,
    MaxNumberOfMessages: 5,
    WaitTimeSeconds: 5,
    MessageAttributeNames: ["All"],
  }));
  return result.Messages || [];
}

async function deleteMessage(receiptHandle) {
  await sqs.send(new DeleteMessageCommand({
    QueueUrl: QUEUE_URL,
    ReceiptHandle: receiptHandle,
  }));
}

module.exports = { enqueueKYCRequest, pollQueue, deleteMessage };

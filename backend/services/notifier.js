const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");

const sns = new SNSClient({ region: "ap-south-1" });
const TOPIC_ARN = "arn:aws:sns:ap-south-1:469510588722:kyc-status-events";

async function publishStatusEvent(sessionId, status, metadata = {}) {
  const message = {
    session_id: sessionId,
    status,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  await sns.send(new PublishCommand({
    TopicArn: TOPIC_ARN,
    Subject: `KYC Status: ${status}`,
    Message: JSON.stringify(message),
    MessageAttributes: {
      status: { DataType: "String", StringValue: status },
    },
  }));

  console.log(`SNS published: kyc.${status} for session ${sessionId}`);
}

module.exports = { publishStatusEvent };

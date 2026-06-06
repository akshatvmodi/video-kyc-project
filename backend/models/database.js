const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");

const client = new DynamoDBClient({ region: "ap-south-1" });
const db = DynamoDBDocumentClient.from(client);

async function seedAgents() {
  const existing = await db.send(new ScanCommand({ TableName: "agents" }));
  if (existing.Items.length > 0) {
    console.log("Agents already seeded, skipping.");
    return;
  }
  const agents = [
    { id: uuidv4(), name: "Priya Sharma", languages: ["Hindi", "English"], skills: ["basic", "premium"], current_load: 0, max_load: 3, status: "active" },
    { id: uuidv4(), name: "Rahul Verma", languages: ["English", "Tamil"], skills: ["basic"], current_load: 0, max_load: 3, status: "active" },
    { id: uuidv4(), name: "Anjali Mehta", languages: ["Hindi", "Marathi", "English"], skills: ["basic", "premium"], current_load: 0, max_load: 3, status: "active" },
  ];
  for (const agent of agents) {
    await db.send(new PutCommand({ TableName: "agents", Item: agent }));
  }
  console.log("Agents seeded into DynamoDB.");
}

async function getAgents() {
  const result = await db.send(new ScanCommand({ TableName: "agents" }));
  return result.Items;
}

async function getAgentById(id) {
  const result = await db.send(new GetCommand({ TableName: "agents", Key: { id } }));
  return result.Item;
}

async function updateAgentLoad(id, delta) {
  await db.send(new UpdateCommand({
    TableName: "agents",
    Key: { id },
    UpdateExpression: "SET current_load = current_load + :delta",
    ExpressionAttributeValues: { ":delta": delta },
  }));
}

async function createSession(data) {
  const session = {
    id: data.id || uuidv4(),
    customer_name: data.customer_name,
    customer_email: data.customer_email || null,
    document_type: data.document_type || null,
    language: data.language || "English",
    status: data.status || "pending",
    agent_id: data.agent_id || null,
    webhook_url: data.webhook_url || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await db.send(new PutCommand({ TableName: "kyc_sessions", Item: session }));
  return session;
}

async function getSessions() {
  const result = await db.send(new ScanCommand({ TableName: "kyc_sessions" }));
  return result.Items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

async function getSessionById(id) {
  const result = await db.send(new GetCommand({ TableName: "kyc_sessions", Key: { id } }));
  return result.Item;
}

async function updateSessionStatus(id, status) {
  const updated_at = new Date().toISOString();
  await db.send(new UpdateCommand({
    TableName: "kyc_sessions",
    Key: { id },
    UpdateExpression: "SET #s = :status, updated_at = :updated_at",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: { ":status": status, ":updated_at": updated_at },
  }));
  return await getSessionById(id);
}

async function logWebhook(data) {
  const log = {
    id: uuidv4(),
    session_id: data.session_id,
    event_type: data.event_type,
    payload: JSON.stringify(data.payload),
    status_code: data.status_code || null,
    created_at: new Date().toISOString(),
  };
  await db.send(new PutCommand({ TableName: "webhook_logs", Item: log }));
  return log;
}

async function getWebhookLogs() {
  const result = await db.send(new ScanCommand({ TableName: "webhook_logs" }));
  return result.Items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
}

async function initDatabase() {
  console.log("Connecting to DynamoDB (ap-south-1)...");
  await seedAgents();
  console.log("DynamoDB ready.");
}

module.exports = {
  initDatabase, getAgents, getAgentById, updateAgentLoad,
  createSession, getSessions, getSessionById, updateSessionStatus,
  logWebhook, getWebhookLogs,
};

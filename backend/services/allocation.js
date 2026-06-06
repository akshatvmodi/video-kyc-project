const { getAgents, updateAgentLoad } = require("../models/database");

async function allocateAgent(language, kycType) {
  const agents = await getAgents();
  const eligible = agents.filter(
    (a) =>
      a.status === "active" &&
      a.languages.includes(language) &&
      a.skills.includes(kycType) &&
      a.current_load < a.max_load
  );
  if (eligible.length === 0) return null;
  const selected = eligible.sort((a, b) => a.current_load - b.current_load)[0];
  await updateAgentLoad(selected.id, 1);
  return selected;
}

async function releaseAgent(agentId) {
  if (!agentId) return;
  await updateAgentLoad(agentId, -1);
}

module.exports = { allocateAgent, releaseAgent };

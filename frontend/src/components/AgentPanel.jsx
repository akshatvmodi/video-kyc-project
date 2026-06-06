import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api'

export default function AgentPanel() {
  const [agents, setAgents] = useState([])

  useEffect(() => {
    fetchAgents()
    const interval = setInterval(fetchAgents, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchAgents = async () => {
    const res = await axios.get(`${API}/agents`)
    setAgents(res.data)
  }

  return (
    <div className="agent-panel">
      <h2>Agent Status</h2>
      {agents.map(agent => (
        <div key={agent.id} className="agent-card">
          <div className="agent-header">
            <h3>{agent.name}</h3>
            <span className={`status-badge ${agent.status}`}>
              {agent.status.toUpperCase()}
            </span>
          </div>
          <p><strong>Email:</strong> {agent.email}</p>
          <p><strong>Languages:</strong> {agent.languages}</p>
          <p><strong>Skills:</strong> {agent.skills}</p>
          <div className="load-bar">
            <span>Load: {agent.current_load}/{agent.max_load}</span>
            <div className="bar">
              <div className="fill"
                style={{ width: `${(agent.current_load / agent.max_load) * 100}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

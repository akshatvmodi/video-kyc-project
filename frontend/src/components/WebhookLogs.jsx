import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api'

export default function WebhookLogs() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchLogs = async () => {
    const res = await axios.get(`${API}/webhooks`)
    setLogs(res.data)
  }

  return (
    <div className="webhook-logs">
      <h2>Webhook Logs</h2>
      {logs.length === 0 && <p>No webhooks fired yet.</p>}
      {logs.map(log => (
        <div key={log.id} className="log-card">
          <div className="log-header">
            <span className="event">{log.event}</span>
            <span className={`log-status ${log.status_code === 200 ? 'success' : 'failed'}`}>
              {log.status_code || 'NO URL'}
            </span>
            <span className="log-time">{new Date(log.created_at).toLocaleString()}</span>
          </div>
          <p><strong>Session:</strong> {log.session_id.slice(0, 8)}...</p>
          <pre>{JSON.stringify(JSON.parse(log.payload), null, 2)}</pre>
        </div>
      ))}
    </div>
  )
}

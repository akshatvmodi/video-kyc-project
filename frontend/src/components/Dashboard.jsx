import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'http://localhost:3001/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, assigned: 0, completed: 0, queued: 0 })
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', document_type: 'aadhaar', language: 'english', webhook_url: ''
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000)
    return () => clearInterval(interval)
  }, [])

  const fetchStats = async () => {
    const res = await axios.get(`${API}/kyc`)
    const sessions = res.data
    setStats({
      total: sessions.length,
      assigned: sessions.filter(s => s.status === 'assigned').length,
      completed: sessions.filter(s => s.status === 'completed').length,
      queued: sessions.filter(s => s.status === 'queued').length,
    })
  }

  const submitKYC = async () => {
    setLoading(true)
    try {
      const res = await axios.post(`${API}/kyc/request`, form)
      setResult(res.data)
      fetchStats()
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card assigned">
          <h3>Assigned</h3>
          <p>{stats.assigned}</p>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <p>{stats.completed}</p>
        </div>
        <div className="stat-card queued">
          <h3>Queued</h3>
          <p>{stats.queued}</p>
        </div>
      </div>

      <div className="request-form">
        <h2>Request New KYC</h2>
        <input placeholder="Customer Name" value={form.customer_name}
          onChange={e => setForm({...form, customer_name: e.target.value})} />
        <input placeholder="Customer Email" value={form.customer_email}
          onChange={e => setForm({...form, customer_email: e.target.value})} />
        <select value={form.document_type}
          onChange={e => setForm({...form, document_type: e.target.value})}>
          <option value="aadhaar">Aadhaar</option>
          <option value="pan">PAN Card</option>
          <option value="passport">Passport</option>
        </select>
        <select value={form.language}
          onChange={e => setForm({...form, language: e.target.value})}>
          <option value="english">English</option>
          <option value="hindi">Hindi</option>
          <option value="gujarati">Gujarati</option>
          <option value="punjabi">Punjabi</option>
        </select>
        <input placeholder="Webhook URL (optional)" value={form.webhook_url}
          onChange={e => setForm({...form, webhook_url: e.target.value})} />
        <button onClick={submitKYC} disabled={loading}>
          {loading ? 'Requesting...' : 'Request KYC'}
        </button>
      </div>

      {result && (
        <div className="result-card">
          <h3>KYC Session Created</h3>
          <p><strong>Session ID:</strong> {result.session_id}</p>
          <p><strong>Status:</strong> {result.status}</p>
          <p><strong>Agent:</strong> {result.agent ? result.agent.name : 'Queued - no agent available'}</p>
          {result.room && <p><strong>Video Link:</strong> <a href={result.room.join_url}>{result.room.join_url}</a></p>}
        </div>
      )}
    </div>
  )
}

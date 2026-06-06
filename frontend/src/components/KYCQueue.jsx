import { useState, useEffect, useRef } from 'react'
import axios from 'axios'

const API = 'http://3.110.1.157:3001/api'

export default function KYCQueue() {
  const [sessions, setSessions] = useState([])
  const [uploading, setUploading] = useState({})
  const [uploadedUrls, setUploadedUrls] = useState({})
  const fileRefs = useRef({})

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 3000)
    return () => clearInterval(interval)
  }, [])

  const fetchSessions = async () => {
    const res = await axios.get(`${API}/kyc`)
    setSessions(res.data)
  }

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/kyc/${id}/status`, { status })
    fetchSessions()
  }

  const uploadDocument = async (sessionId, file) => {
    setUploading(prev => ({ ...prev, [sessionId]: true }))
    try {
      const res = await axios.post(`${API}/kyc/${sessionId}/upload`, file, {
        headers: {
          'Content-Type': file.type,
          'x-file-name': file.name,
        }
      })
      setUploadedUrls(prev => ({ ...prev, [sessionId]: res.data.url }))
      alert(`Document uploaded successfully!`)
    } catch (err) {
      alert(`Upload failed: ${err.message}`)
    } finally {
      setUploading(prev => ({ ...prev, [sessionId]: false }))
    }
  }

  const statusColor = {
    requested: '#ffa500',
    queued: '#888',
    assigned: '#2196F3',
    'in-progress': '#9c27b0',
    completed: '#4caf50',
    cancelled: '#f44336'
  }

  return (
    <div className="kyc-queue">
      <h2>KYC Sessions</h2>
      {sessions.length === 0 && <p>No sessions yet. Request a KYC from Dashboard.</p>}
      {sessions.map(session => (
        <div key={session.id} className="session-card">
          <div className="session-header">
            <span className="status-badge" style={{ background: statusColor[session.status] }}>
              {session.status.toUpperCase()}
            </span>
            <span className="session-id">{session.id.slice(0, 8)}...</span>
          </div>
          <p><strong>Customer:</strong> {session.customer_name}</p>
          <p><strong>Email:</strong> {session.customer_email}</p>
          <p><strong>Document:</strong> {session.document_type}</p>
          <p><strong>Agent ID:</strong> {session.agent_id || 'Not assigned'}</p>
          <p><strong>Created:</strong> {new Date(session.created_at).toLocaleString()}</p>

          <div className="actions">
            {session.status === 'assigned' &&
              <button onClick={() => updateStatus(session.id, 'in-progress')}>Start Call</button>}
            {session.status === 'in-progress' &&
              <button onClick={() => updateStatus(session.id, 'completed')}>Complete</button>}
            {!['completed', 'cancelled'].includes(session.status) &&
              <button className="cancel" onClick={() => updateStatus(session.id, 'cancelled')}>Cancel</button>}
          </div>

          <div className="upload-section">
            <input
              type="file"
              ref={el => fileRefs.current[session.id] = el}
              style={{ display: 'none' }}
              onChange={e => {
                const file = e.target.files[0]
                if (file) uploadDocument(session.id, file)
              }}
            />
            <button
              className="upload-btn"
              onClick={() => fileRefs.current[session.id].click()}
              disabled={uploading[session.id]}
            >
              {uploading[session.id] ? 'Uploading...' : '📎 Upload Document'}
            </button>
            {uploadedUrls[session.id] && (
              <a href={uploadedUrls[session.id]} target="_blank" rel="noreferrer">
                ✅ View Uploaded Doc
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

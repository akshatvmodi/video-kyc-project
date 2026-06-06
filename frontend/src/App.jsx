import { useState } from 'react'
import Dashboard from './components/Dashboard'
import AgentPanel from './components/AgentPanel'
import KYCQueue from './components/KYCQueue'
import WebhookLogs from './components/WebhookLogs'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'queue', label: 'KYC Queue' },
    { id: 'agents', label: 'Agents' },
    { id: 'webhooks', label: 'Webhook Logs' },
  ]

  return (
    <div className="app">
      <header className="header">
        <h1>Video KYC System</h1>
        <nav>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? 'active' : ''}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'queue' && <KYCQueue />}
        {activeTab === 'agents' && <AgentPanel />}
        {activeTab === 'webhooks' && <WebhookLogs />}
      </main>
    </div>
  )
}

export default App

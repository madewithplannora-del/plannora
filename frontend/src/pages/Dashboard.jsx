import React from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/pages.css'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <main className="page">
      <div className="container">
        <h1>Welcome, {user?.username}!</h1>
        <p style={{ marginBottom: 'var(--spacing-2xl)', color: 'var(--text-secondary)' }}>
          Your dashboard will show your events and favorites here
        </p>
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>My Events</h3>
            <p>No events yet. Start planning!</p>
          </div>
          <div className="dashboard-card">
            <h3>Saved Vendors</h3>
            <p>No saved vendors yet.</p>
          </div>
          <div className="dashboard-card">
            <h3>Recent Activity</h3>
            <p>No recent activity.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

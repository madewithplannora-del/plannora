import React from 'react'
import { useAuth } from '../context/AuthContext'
import '../styles/pages.css'

export default function Profile() {
  const { user } = useAuth()

  return (
    <main className="page">
      <div className="container">
        <h1>My Profile</h1>
        <div className="dashboard-card" style={{ maxWidth: '600px' }}>
          <h2>{user?.username}</h2>
          <p><strong>Email:</strong> (Email verification info)</p>
          <p><strong>Role:</strong> {user?.role === 'vendor' ? 'Vendor' : 'Client'}</p>
          <p><strong>Email Verified:</strong> {user?.emailverified ? 'Yes' : 'No'}</p>
          {user?.role === 'vendor' && (
            <p><strong>Vendor Verified:</strong> {user?.vendorverified ? 'Yes' : 'No'}</p>
          )}
        </div>
      </div>
    </main>
  )
}

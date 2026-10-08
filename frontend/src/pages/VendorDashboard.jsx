import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { vendorService } from '../services/vendor.service'
import { Button } from '../components/Button'
import { Input, Textarea } from '../components/Input'
import '../styles/pages.css'

export default function VendorDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [number, setNumber] = useState('')
  const [bio, setBio] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('number', number)
    formData.append('BusinessName', businessName)
    formData.append('bio', bio)
    if (profilePicture) formData.append('profilePicture', profilePicture)

    try {
      await vendorService.createProfile(formData)
      setMessage('Vendor profile created successfully!')
    } catch (err) {
      setMessage('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="page">
      <div className="container">
        <h1>Vendor Dashboard</h1>
        <p style={{ marginBottom: 'var(--spacing-2xl)', color: 'var(--text-secondary)' }}>
          Manage your vendor profile and business information
        </p>

        {message && <div className={`error-message ${message.includes('successfully') ? 'success' : ''}`}>{message}</div>}

        <div style={{ maxWidth: '600px' }}>
          <h2>Create Your Vendor Profile</h2>
          <form onSubmit={handleSubmit}>
            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
            <Input
              label="Phone Number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              required
            />
            <Textarea
              label="Business Description"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers about your business"
            />
            <div className="input-group">
              <label className="input-label">Profile Picture</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files?.[0])}
                style={{ padding: 'var(--spacing-md)' }}
              />
            </div>
            <Button type="submit" fullWidth loading={loading}>
              Create Profile
            </Button>
          </form>
        </div>
      </div>
    </main>
  )
}

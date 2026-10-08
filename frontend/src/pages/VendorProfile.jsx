import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { vendorService } from '../services/vendor.service'
import { Button } from '../components/Button'
import '../styles/pages.css'

export default function VendorProfile() {
  const { id } = useParams()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const data = await vendorService.getProfileById(id)
        setVendor(data.vendorProfile)
      } catch (err) {
        setError(err.message || 'Failed to load vendor')
      } finally {
        setLoading(false)
      }
    }
    fetchVendor()
  }, [id])

  const handleContact = async () => {
    try {
      await vendorService.recordContactClick(id)
    } catch (err) {
      console.error('Failed to record contact', err)
    }
  }

  if (loading) return <main className="page"><div className="container">Loading...</div></main>
  if (error) return <main className="page"><div className="container error-message">{error}</div></main>
  if (!vendor) return <main className="page"><div className="container">Vendor not found</div></main>

  return (
    <main className="page">
      <div className="container">
        <div className="dashboard-grid">
          <div>
            {vendor.logo && <img src={vendor.logo} alt={vendor.BusinessName} style={{ width: '100%', borderRadius: '4px', marginBottom: 'var(--spacing-lg)' }} />}
            <h1>{vendor.BusinessName}</h1>
            <p>{vendor.bio}</p>
            <p><strong>Contact:</strong> {vendor.Businessemail}</p>
            <p><strong>Phone:</strong> {vendor.number}</p>
            <Button onClick={handleContact} fullWidth style={{ marginTop: 'var(--spacing-lg)' }}>
              Contact Vendor
            </Button>
          </div>
          <div className="dashboard-card">
            <h3>Vendor Stats</h3>
            <p><strong>Profile Visits:</strong> {vendor.visit_no}</p>
            <p><strong>Contact Clicks:</strong> {vendor.contact_clicks}</p>
            <p><strong>Rating:</strong> {vendor.avg_rating_on_all_post || 'N/A'}</p>
          </div>
        </div>
      </div>
    </main>
  )
}

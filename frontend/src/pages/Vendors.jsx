import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/pages.css'

export default function Vendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Placeholder - will load real vendors from backend
    setLoading(false)
  }, [])

  return (
    <main className="page">
      <div className="container">
        <h1>Explore Vendors</h1>
        <p style={{ marginBottom: 'var(--spacing-2xl)', color: 'var(--text-secondary)' }}>
          Find and connect with trusted vendors for your event
        </p>

        {error && <div className="error-message">{error}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>Loading...</div>
        ) : vendors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <p>No vendors found. Check back soon!</p>
          </div>
        ) : (
          <div className="vendors-grid">
            {vendors.map((vendor) => (
              <Link key={vendor._id} to={`/vendors/${vendor._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="vendor-card">
                  {vendor.logo && <img src={vendor.logo} alt={vendor.BusinessName} className="vendor-card-image" />}
                  <div className="vendor-card-content">
                    <div className="vendor-card-name">{vendor.BusinessName}</div>
                    <div className="vendor-card-description">{vendor.bio}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

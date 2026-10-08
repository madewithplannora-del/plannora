import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/components.css'

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <header className="header">
      <div className="header-container container">
        <Link to="/" className="header-logo">
          PLANNORA
        </Link>
        <nav className={`header-nav ${mobileOpen ? 'mobile-open' : ''}`}>
          <Link to="/vendors" className="nav-link">Vendors</Link>
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-cta">Register</Link>
            </>
          ) : (
            <>
              {user?.role === 'vendor' && <Link to="/vendor/dashboard" className="nav-link">Dashboard</Link>}
              {user?.role === 'client' && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
              <Link to="/profile" className="nav-link">{user?.username}</Link>
              <button onClick={handleLogout} className="nav-logout">Logout</button>
            </>
          )}
        </nav>
        <button
          className="header-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  )
}

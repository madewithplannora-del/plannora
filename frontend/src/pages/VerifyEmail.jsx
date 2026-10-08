import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import '../styles/pages.css'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyOtp, loading } = useAuth()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const email = location.state?.email

  if (!email) {
    return (
      <main className="page page-auth">
        <div className="container">
          <div className="auth-card">
            <h2>Session Expired</h2>
            <p>Please register again to verify your email.</p>
            <Button onClick={() => navigate('/register')} fullWidth>
              Back to Register
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    const result = await verifyOtp(email, otp)
    if (result.success) {
      navigate('/vendors')
    } else {
      setError(result.error || 'OTP verification failed')
    }
  }

  return (
    <main className="page page-auth">
      <div className="container">
        <div className="auth-card">
          <h1>Verify Your Email</h1>
          <p className="auth-subtitle">Enter the 6-digit code sent to {email}</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <Input
              label="Verification Code"
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              required
            />

            <Button
              type="submit"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Verify
            </Button>
          </form>

          <p className="auth-footer">
            <a href="#resend" className="auth-link">Resend code</a>
          </p>
        </div>
      </div>
    </main>
  )
}

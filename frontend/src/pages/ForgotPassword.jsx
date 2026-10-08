import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import '../styles/pages.css'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const { forgotPassword, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: email, 2: otp verification

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email) {
      setError('Please enter your email')
      return
    }
    const result = await forgotPassword(email)
    if (result.success) {
      setStep(2)
    } else {
      setError(result.error)
    }
  }

  return (
    <main className="page page-auth">
      <div className="container">
        <div className="auth-card">
          <h1>Reset Password</h1>
          {step === 1 ? (
            <>
              <p className="auth-subtitle">Enter your email to receive a reset code</p>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleEmailSubmit}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" fullWidth loading={loading}>Send Code</Button>
              </form>
              <p className="auth-footer">
                <Link to="/login" className="auth-link">Back to Login</Link>
              </p>
            </>
          ) : (
            <>
              <p className="auth-subtitle">Check your email for the reset code, then reset your password.</p>
              <Link to="/reset-password" className="auth-link">
                <Button fullWidth>Continue to Reset</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

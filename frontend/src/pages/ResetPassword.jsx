import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import '../styles/pages.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { resetPassword, loading } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    const result = await resetPassword(password)
    if (result.success) {
      navigate('/login')
    } else {
      setError(result.error)
    }
  }

  return (
    <main className="page page-auth">
      <div className="container">
        <div className="auth-card">
          <h1>Create New Password</h1>
          <p className="auth-subtitle">Enter a strong password</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth loading={loading}>Reset Password</Button>
          </form>
          <p className="auth-footer">
            <Link to="/login" className="auth-link">Back to Login</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

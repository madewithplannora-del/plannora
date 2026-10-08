import React, { createContext, useState, useEffect } from 'react'
import { authService } from '../services/auth.service'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthContext: Checking authentication...')
        const response = await authService.getCurrentUser()
        console.log('AuthContext: Got user data:', response)
        setUser(response.user)
      } catch (err) {
        console.error('AuthContext: Error checking auth:', err)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (username, email, password) => {
    setError(null)
    setLoading(true)
    try {
      await authService.login(username, email, password)
      const response = await authService.getCurrentUser()
      setUser(response.user)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, email, password, role = 'client') => {
    setError(null)
    setLoading(true)
    try {
      await authService.register(username, email, password, role)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (email, otp) => {
    setError(null)
    setLoading(true)
    try {
      await authService.verifyOtp(email, otp)
      const response = await authService.getCurrentUser()
      setUser(response.user)
      return { success: true }
    } catch (err) {
      const message = err.message || 'OTP verification failed'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setError(null)
    try {
      await authService.logout()
      setUser(null)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Logout failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const forgotPassword = async (email) => {
    setError(null)
    try {
      await authService.forgotPassword(email)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Failed to send reset email'
      setError(message)
      return { success: false, error: message }
    }
  }

  const verifyForgotOtp = async (email, otp) => {
    setError(null)
    try {
      await authService.verifyForgotOtp(email, otp)
      return { success: true }
    } catch (err) {
      const message = err.message || 'OTP verification failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const resetPassword = async (password) => {
    setError(null)
    try {
      await authService.resetPassword(password)
      return { success: true }
    } catch (err) {
      const message = err.message || 'Password reset failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    verifyOtp,
    logout,
    forgotPassword,
    verifyForgotOtp,
    resetPassword,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

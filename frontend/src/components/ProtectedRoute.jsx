import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) return <div className="container" style={{ padding: '60px 20px' }}>Loading...</div>
  if (!isAuthenticated) return <Navigate to="/login" />
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" />

  return children
}

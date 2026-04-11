import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const user = localStorage.getItem('user')

  if (!user) {
    return <Navigate to="/login" replace />
  }

  try {
    const userData = JSON.parse(user)
    if (!userData._id) {
      return <Navigate to="/login" replace />
    }
  } catch {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return <Navigate to="/login" replace />
  }

  return children
}

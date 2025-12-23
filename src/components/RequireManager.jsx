import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

export default function RequireManager({ children }) {
  const { user } = useAuth()

  if (user?.role !== 'manager') {
    return <Navigate to="/reports" replace />
  }

  return children
}

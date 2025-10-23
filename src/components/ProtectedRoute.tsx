import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles: string[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // Check if user has the required role
  if (user.role && allowedRoles.includes(user.role)) {
    return <>{children}</>
  }

  // Redirect to appropriate page based on user role
  if (user.role === 'server') {
    return <Navigate to="/server" />
  } else if (user.role === 'kitchen') {
    return <Navigate to="/kitchen" />
  } else if (user.role === 'bar') {
    return <Navigate to="/bar" />
  }

  // Default fallback
  return <Navigate to="/login" />
}

export default ProtectedRoute

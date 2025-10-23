import { Routes, Route, Navigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAuth } from './hooks/useAuth'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/owner/Dashboard'
import FloorLayout from './pages/owner/FloorLayout'
import MenuEditor from './pages/owner/MenuEditor'
import Analytics from './pages/owner/Analytics'
import StaffManagement from './pages/owner/StaffManagement'
import ServerView from './pages/server/ServerView'
import KitchenDisplay from './pages/kitchen/KitchenDisplay'
import BarDisplay from './pages/bar/BarDisplay'
import NotFound from './pages/NotFound'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          {/* Owner Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/floor-layout" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <FloorLayout />
            </ProtectedRoute>
          } />
          <Route path="/menu-editor" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <MenuEditor />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={['owner']}>
              <StaffManagement />
            </ProtectedRoute>
          } />

          {/* Server Routes */}
          <Route path="/server" element={
            <ProtectedRoute allowedRoles={['owner', 'server']}>
              <ServerView />
            </ProtectedRoute>
          } />

          {/* Kitchen Routes */}
          <Route path="/kitchen" element={
            <ProtectedRoute allowedRoles={['owner', 'kitchen']}>
              <KitchenDisplay />
            </ProtectedRoute>
          } />

          {/* Bar Routes */}
          <Route path="/bar" element={
            <ProtectedRoute allowedRoles={['owner', 'bar']}>
              <BarDisplay />
            </ProtectedRoute>
          } />
        </Route>

        {/* Redirect from root to dashboard or login */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        
        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DndProvider>
  )
}

export default App

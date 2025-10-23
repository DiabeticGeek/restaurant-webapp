import { Routes, Route, Navigate } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { useAuth } from './hooks/useAuth'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import RoleSelector from './pages/auth/RoleSelector';
import OwnerLogin from './pages/auth/OwnerLogin';
import ServerLogin from './pages/auth/ServerLogin';
import KitchenLogin from './pages/auth/KitchenLogin';
import BarLogin from './pages/auth/BarLogin';
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
  const { user } = useAuth()

  return (
    <DndProvider backend={HTML5Backend}>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
                    <Route path="/login" element={!user ? <RoleSelector /> : <Navigate to="/dashboard" />} />
            <Route path="/login/owner" element={!user ? <OwnerLogin /> : <Navigate to="/dashboard" />} />
            <Route path="/login/server" element={!user ? <ServerLogin /> : <Navigate to="/server" />} />
            <Route path="/login/kitchen" element={!user ? <KitchenLogin /> : <Navigate to="/kitchen" />} />
            <Route path="/login/bar" element={!user ? <BarLogin /> : <Navigate to="/bar" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          {/* Owner Routes */}
          <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/floor-layout" element={<FloorLayout />} />
            <Route path="/menu-editor" element={<MenuEditor />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/staff" element={<StaffManagement />} />
          </Route>

          {/* Server Routes */}
          <Route element={<ProtectedRoute allowedRoles={['owner', 'server']} />}>
            <Route path="/server" element={<ServerView />} />
          </Route>

          {/* Kitchen Routes */}
          <Route element={<ProtectedRoute allowedRoles={['owner', 'kitchen']} />}>
            <Route path="/kitchen" element={<KitchenDisplay />} />
          </Route>

          {/* Bar Routes */}
          <Route element={<ProtectedRoute allowedRoles={['owner', 'bar']} />}>
            <Route path="/bar" element={<BarDisplay />} />
          </Route>
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

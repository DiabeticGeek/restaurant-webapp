import { Outlet } from 'react-router-dom'
import Sidebar from '../components/navigation/Sidebar'
import Header from '../components/navigation/Header'
import { useAuth } from '../hooks/useAuth'

const MainLayout = () => {
  const { user } = useAuth()

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MainLayout

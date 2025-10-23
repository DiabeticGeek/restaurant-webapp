import { Outlet } from 'react-router-dom'
import Navigation from '../components/Navigation'
import Header from '../components/navigation/Header'

const MainLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Navigation */}
      <Navigation />
      
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

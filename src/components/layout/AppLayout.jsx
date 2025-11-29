import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import '../../App.css'

const AppLayout = () => {
  return (
    <div className="layout-shell">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout

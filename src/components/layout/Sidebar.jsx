import { NavLink } from 'react-router-dom'
import { LuLayoutDashboard, LuNewspaper, LuBriefcase, LuLogOut } from 'react-icons/lu'
import { useDispatch } from 'react-redux'
import { logout } from '../../features/auth/authSlice'

const Sidebar = () => {
  const dispatch = useDispatch()
  const navItems = [
    { label: 'Dashboard', icon: <LuLayoutDashboard />, to: '/' },
    { label: 'Blogs', icon: <LuNewspaper />, to: '/blogs' },
    { label: 'Services', icon: <LuBriefcase />, to: '/services' },
    { label: 'Testimonials', icon: <LuNewspaper />, to: '/testimonials' },
    { label: 'Request Callbacks', icon: <LuNewspaper />, to: '/requestcallbacks' },
    { label: 'Newsletter', icon: <LuNewspaper />, to: '/newsletter' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        {/* <span className="brand-dot" /> */}
        <div>
          <p className="brand-title">
            <img  src='./1.png'></img>
          </p>
          {/* <p className="brand-subtitle">Admin Panel</p> */}
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="nav-link nav-link--muted" onClick={() => dispatch(logout())}>
        <span className="nav-icon">
          <LuLogOut />
        </span>
        <span>Logout</span>
      </button>
    </aside>
  )
}

export default Sidebar

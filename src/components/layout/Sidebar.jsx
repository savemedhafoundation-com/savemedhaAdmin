import { NavLink } from 'react-router-dom'
import { LuBriefcase, LuChartBar, LuLayoutDashboard, LuLogOut, LuNewspaper, LuUsers } from 'react-icons/lu'
import { useDispatch } from 'react-redux'
import { logout } from '../../features/auth/authSlice'

const Sidebar = () => {
  const dispatch = useDispatch()
  const navItems = [
    { label: 'Dashboard', icon: <LuLayoutDashboard />, to: '/' },
    { label: 'Blogs', icon: <LuNewspaper />, to: '/blogs' },
    { label: 'Services', icon: <LuBriefcase />, to: '/services' },
    { label: 'Treatments', icon: <LuBriefcase />, to: '/treatments' },
    { label: 'Treatment FAQs', icon: <LuBriefcase />, to: '/treatment-faqs' },
    { label: 'Upcoming Events', icon: <LuBriefcase />, to: '/upcoming-events' },
    { label: 'Ongoing Events', icon: <LuBriefcase />, to: '/ongoing-events' },
    { label: 'Youtube Success stories', icon: <LuBriefcase />, to: '/patient-success-stories' },
    { label: 'Contact us requests', icon: <LuBriefcase />, to: '/contacts' },
    { label: 'Our Locations', icon: <LuBriefcase />, to: '/addresses' },
    { label: 'Ebooks', icon: <LuBriefcase />, to: '/ebooks' },
    { label: 'Applications', icon: <LuBriefcase />, to: '/applications' },
    { label: 'Jobs', icon: <LuBriefcase />, to: '/jobs' },
    { label: 'Testimonials', icon: <LuNewspaper />, to: '/testimonials' },
    { label: 'Patient Query Requests', icon: <LuNewspaper />, to: '/requestcallbacks' },
    { label: 'Newsletter', icon: <LuNewspaper />, to: '/newsletter' },
    { label: 'Preference Events', icon: <LuChartBar />, to: '/preference-events' },
    { label: 'Admin Users', icon: <LuUsers />, to: '/users' },
  ]

  return (
    <aside className="sidebar" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
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

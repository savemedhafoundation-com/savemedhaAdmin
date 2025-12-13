import { useSelector } from 'react-redux'
import { LuBell, LuSearch } from 'react-icons/lu'
import ThemeToggle from '../common/ThemeToggle'

const Header = () => {
  const user = useSelector((state) => state.auth.user)
  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="search">
          <LuSearch size={16} />
          <input type="search" placeholder="Search content, services, users" />
        </div>
      </div>
      <div className="topbar__right">
        <ThemeToggle />
        <button className="icon-button" aria-label="Notifications">
          <LuBell size={18} />
        </button>
        <div className="user-chip">
          <div className="user-avatar">{user?.firstName?.[0].toUpperCase() || 'A'}</div>
          <div>
            <p className="user-name">{user?.firstName || 'Admin'} {user?.lastName || ''}</p>
            <p className="user-role">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

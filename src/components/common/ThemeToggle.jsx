import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LuMoon, LuSun } from 'react-icons/lu'
import { setTheme, toggleTheme } from '../../features/ui/uiSlice'

const ThemeToggle = () => {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.ui.theme)

  useEffect(() => {
    const saved = localStorage.getItem('savemedha-theme')
    if (saved) {
      dispatch(setTheme(saved))
    }
  }, [dispatch])

  useEffect(() => {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
  }, [theme])

  return (
    <button className="icon-button" onClick={() => dispatch(toggleTheme())} aria-label="Toggle theme">
      {theme === 'dark' ? <LuSun size={18} /> : <LuMoon size={18} />}
    </button>
  )
}

export default ThemeToggle

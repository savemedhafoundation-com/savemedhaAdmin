import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LuChartBar, LuListChecks, LuSparkles } from 'react-icons/lu'
import { fetchBlogs } from '../features/blogs/blogSlice'
import { fetchServices } from '../features/services/serviceSlice'

const Dashboard = () => {
  const dispatch = useDispatch()
  const blogCount = useSelector((state) => state.blogs.items.length)
  const serviceCount = useSelector((state) => state.services.items.length)

  useEffect(() => {
    dispatch(fetchBlogs())
    dispatch(fetchServices())
  }, [dispatch])

  const cards = [
    { label: 'Active Blogs', value: blogCount, icon: <LuListChecks /> },
    { label: 'Total Services Available', value: serviceCount, icon: <LuSparkles /> },
    { label: 'Engagement', value: '68%', icon: <LuChartBar /> },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Admin Dashboard</h2>
          <p className="muted">Track platform health, content output, and service performance.</p>
        </div>
      </div>

      <div className="grid">
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon">{card.icon}</div>
            <p className="muted">{card.label}</p>
            <p className="stat-value">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Dashboard

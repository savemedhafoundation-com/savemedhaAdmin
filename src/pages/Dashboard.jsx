import { useSelector } from 'react-redux'
import { LuChartBar, LuListChecks, LuSparkles } from 'react-icons/lu'

const Dashboard = () => {
  const blogCount = useSelector((state) => state.blogs.items.length)
  const serviceCount = useSelector((state) => state.services.items.length)

  const cards = [
    { label: 'Active Blogs', value: blogCount, icon: <LuListChecks /> },
    { label: 'Services Live', value: serviceCount, icon: <LuSparkles /> },
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

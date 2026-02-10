import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import 'chart.js/auto'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const getValueByPath = (obj, path) =>
  path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)

const buildCounts = (events, path) => {
  const map = new Map()
  events.forEach((event) => {
    const raw = getValueByPath(event, path)
    const value = typeof raw === 'string' ? raw.trim() : raw
    const label = value ? String(value) : 'Unknown'
    map.set(label, (map.get(label) || 0) + 1)
  })
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
}

const buildChartData = (entries) => ({
  labels: entries.map(([label]) => label),
  datasets: [
    {
      label: 'Total',
      data: entries.map(([, count]) => count),
      backgroundColor: 'rgba(31, 122, 236, 0.25)',
      borderColor: 'rgba(31, 122, 236, 0.9)',
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => ` ${ctx.parsed.x} events`,
      },
    },
  },
  scales: {
    x: { beginAtZero: true, ticks: { precision: 0 } },
    y: { ticks: { autoSkip: false } },
  },
}

const PreferenceEvents = () => {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true)
      setError('')
      try {
        const { data } = await api.get('/preference-events')
        setEvents(data?.events || [])
      } catch (err) {
        const message = err?.response?.data?.message || 'Failed to load preference events'
        setError(message)
        toast.error(message)
      } finally {
        setIsLoading(false)
      }
    }
    loadEvents()
  }, [])

  const charts = useMemo(
    () => [
      { key: 'country_name', title: 'Country', path: 'location.country_name' },
      { key: 'state_prov', title: 'State/Province', path: 'location.state_prov' },
      { key: 'district', title: 'District', path: 'location.district' },
      { key: 'city', title: 'City', path: 'location.city' },
      { key: 'zipcode', title: 'Zip Code', path: 'location.zipcode' },
    ],
    [],
  )

  const maxItems = 12

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Preferences</p>
          <h2>Preference Events</h2>
          <p className="muted">
            Analyze location intent from preference events by country, state, district, city, and zip code.
          </p>
        </div>
      </div>

      <div className="grid">
        <div className="stat-card">
          <p className="muted">Total events</p>
          <p className="stat-value">{events.length}</p>
        </div>
        <div className="stat-card">
          <p className="muted">Last updated</p>
          <p className="stat-value" style={{ fontSize: '1.3rem' }}>
            {events[0]?.createdAt ? new Date(events[0].createdAt).toLocaleString() : 'N/A'}
          </p>
        </div>
      </div>

      {isLoading ? <p className="muted">Loading preference events...</p> : null}
      {error ? <p className="form-error">{error}</p> : null}

      <div className="grid two-col">
        {charts.map((chart) => {
          const entries = buildCounts(events, chart.path).slice(0, maxItems)
          return (
            <section key={chart.key} className="stat-card" style={{ minHeight: 360 }}>
              <div style={{ marginBottom: '12px' }}>
                <p className="eyebrow">{chart.title}</p>
                <h3 style={{ margin: '4px 0' }}>Top {chart.title} counts</h3>
              </div>
              {entries.length === 0 ? (
                <p className="muted">No data available.</p>
              ) : (
                <div style={{ height: 260 }}>
                  <Bar data={buildChartData(entries)} options={chartOptions} />
                </div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default PreferenceEvents

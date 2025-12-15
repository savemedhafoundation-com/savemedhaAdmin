import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuTrash2, LuMapPin, LuCalendar } from 'react-icons/lu'
import { fetchOngoingEvents } from '../../features/ongoingEvents/ongoingEventSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const OngoingEventList = () => {
  const dispatch = useDispatch()
  const { items: events, status, error } = useSelector((state) => state.ongoingEvents)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchOngoingEvents())
    }
  }, [status, dispatch])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Events</p>
          <h2>Ongoing Events</h2>
          <p className="muted">Manage currently active events.</p>
        </div>
        <Link className="primary-button" to="/ongoing-events/new">
          <LuPlus size={16} />
          New Event
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading events...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {events.map((event) => (
          <article key={event._id} className="card-row blog-card">
            <div className="blog-thumb">
              {event.images && event.images.length ? (
                <img src={event.images[0].url} alt={event.title} />
              ) : (
                <div className="thumb-placeholder" />
              )}
            </div>
            <div className="blog-body">
              <p className="card-title">{event.title}</p>
              <p className="muted">{event.description}</p>
              <p className="muted" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                <LuCalendar size={14} />
                <span>{event.eventDateTime ? new Date(event.eventDateTime).toLocaleString() : '--'}</span>
              </p>
              <p className="muted" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <LuMapPin size={14} />
                <span>{event.venue}</span>
              </p>
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/ongoing-events/${event._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger"
                disabled={deletingId === event._id}
                onClick={async () => {
                  setDeletingId(event._id)
                  try {
                    await api.delete(`/ongoing-events/${event._id}`)
                    toast.success('Event deleted')
                    dispatch(fetchOngoingEvents())
                  } catch (err) {
                    toast.error(err?.response?.data?.message || 'Failed to delete event')
                  } finally {
                    setDeletingId(null)
                  }
                }}
              >
                {deletingId === event._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === event._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default OngoingEventList

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuTrash2, LuClock3, LuYoutube } from 'react-icons/lu'
import { fetchPatientSuccess } from '../../features/patientSuccess/patientSuccessSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const PatientSuccessList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.patientSuccess)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPatientSuccess())
    }
  }, [status, dispatch])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Patient Success</p>
          <h2>Success Stories</h2>
          <p className="muted">Manage curated patient recovery stories.</p>
        </div>
        <Link className="primary-button" to="/patient-success-stories/new">
          <LuPlus size={16} />
          New Story
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading stories...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((story) => (
          <article key={story._id} className="card-row blog-card">
            <div className="blog-body">
              <p className="card-title">{story.title}</p>
              <p className="muted" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <LuYoutube size={14} />
                <a href={story.youtubeUrl} target="_blank" rel="noreferrer">
                  {story.youtubeUrl}
                </a>
              </p>
              <p className="muted" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <LuClock3 size={14} />
                <span>{story.duration}</span>
              </p>
              <p className="muted" style={{ marginTop: '8px' }}>
                {story.description}
              </p>
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/patient-success-stories/${story._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger"
                disabled={deletingId === story._id}
                onClick={async () => {
                  setDeletingId(story._id)
                  try {
                    await api.delete(`/patient-success-stories/${story._id}`)
                    toast.success('Story deleted')
                    dispatch(fetchPatientSuccess())
                  } catch (err) {
                    toast.error(err?.response?.data?.message || 'Failed to delete story')
                  } finally {
                    setDeletingId(null)
                  }
                }}
              >
                {deletingId === story._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === story._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default PatientSuccessList

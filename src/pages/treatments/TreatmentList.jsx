import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuTrash2, LuSquare } from 'react-icons/lu'
import { fetchTreatments } from '../../features/treatments/treatmentSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const TreatmentList = () => {
  const dispatch = useDispatch()
  const { items: treatments, status, error } = useSelector((state) => state.treatments)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTreatments())
    }
  }, [status, dispatch])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Treatments</p>
          <h2>Treatment Library</h2>
          <p className="muted">Manage treatment titles, brand color, and images.</p>
        </div>
        <Link className="primary-button" to="/treatments/new">
          <LuPlus size={16} />
          New Treatment
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading treatments...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {treatments.map((treatment) => (
          <article key={treatment._id} className="card-row blog-card">
            <div className="blog-thumb">
              {treatment.image ? <img src={treatment.image} alt={treatment.title} /> : <div className="thumb-placeholder" />}
            </div>
            <div className="blog-body">
              <p className="card-title">{treatment.title}</p>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuSquare color={treatment.colorCode} />
                <span>{treatment.colorCode}</span>
              </p>
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/treatments/${treatment._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger"
                disabled={deletingId === treatment._id}
                onClick={async () => {
                  setDeletingId(treatment._id)
                  try {
                    await api.delete(`/treatments/${treatment._id}`)
                    toast.success('Treatment deleted')
                    dispatch(fetchTreatments())
                  } catch (err) {
                    toast.error(err?.response?.data?.message || 'Failed to delete treatment')
                  } finally {
                    setDeletingId(null)
                  }
                }}
              >
                {deletingId === treatment._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === treatment._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default TreatmentList

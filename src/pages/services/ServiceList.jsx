import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuTrash2 } from 'react-icons/lu'
import { fetchServices } from '../../features/services/serviceSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const ServiceList = () => {
  const [deletingId, setDeletingId] = useState(null)
  const dispatch = useDispatch()
  const { items: services, status, error } = useSelector((state) => state.services)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchServices())
    }
  }, [status, dispatch])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Services</p>
          <h2>Service Catalog</h2>
          <p className="muted">Manage offerings, pricing, and publishing.</p>
        </div>
        <Link className="primary-button" to="/services/new">
          <LuPlus size={16} />
          New Service
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading services...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {services.map((service) => (
          <article key={service._id} className="card-row blog-card">
            <div className="blog-thumb">
              {service.imageUrl ? <img src={service.imageUrl} alt={service.title} /> : <div className="thumb-placeholder" />}
            </div>
            <div className="blog-body">
              <p className="card-title">{service.title}</p>
              <p className="muted">{service.description}</p>
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/services/${service._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger"
                disabled={deletingId === service._id}
                onClick={async () => {
                  setDeletingId(service._id)
                  try {
                    await api.delete(`/services/${service._id}`)
                    toast.success('Service deleted')
                    dispatch(fetchServices())
                  } catch (err) {
                    toast.error(err?.response?.data?.message || 'Failed to delete service')
                  } finally {
                    setDeletingId(null)
                  }
                }}
              >
                {deletingId === service._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === service._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ServiceList

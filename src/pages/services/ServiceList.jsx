import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuTrash2 } from 'react-icons/lu'
import { deleteService } from '../../features/services/serviceSlice'

const ServiceList = () => {
  const services = useSelector((state) => state.services.items)
  const dispatch = useDispatch()

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

      <div className="card-list">
        {services.map((service) => (
          <article key={service.id} className="card-row">
            <div>
              <p className="card-title">{service.name}</p>
              <p className="muted">${service.price}</p>
              <p className="pill">{service.status}</p>
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/services/${service.id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button className="ghost-button danger" onClick={() => dispatch(deleteService(service.id))}>
                <LuTrash2 size={16} />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ServiceList

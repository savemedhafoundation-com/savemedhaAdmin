import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuMapPin, LuPhone, LuPlus, LuTrash2, LuPencilLine } from 'react-icons/lu'
import { fetchAddresses, deleteAddress } from '../../features/addresses/addressSlice'
import { toast } from 'react-toastify'

const AddressList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.addresses)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAddresses())
    }
  }, [status, dispatch])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await dispatch(deleteAddress(id)).unwrap()
      toast.success('Address deleted')
    } catch (err) {
      toast.error(err || 'Failed to delete address')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Addresses</p>
          <h2>Office Locations</h2>
          <p className="muted">Manage office locations, phone, and map links.</p>
        </div>
        <Link className="primary-button" to="/addresses/new">
          <LuPlus size={16} />
          New Address
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading addresses...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((address) => (
          <article key={address._id} className="card-row blog-card">
            <div className="blog-body">
              <p className="card-title">{address.title}</p>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuMapPin size={14} />
                <span>{address.address}</span>
              </p>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuPhone size={14} />
                <span>{address.phone}</span>
              </p>
              {address.mapLocation ? (
                <p className="muted">
                  <a href={address.mapLocation} target="_blank" rel="noreferrer">
                    View on map
                  </a>
                </p>
              ) : null}
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/addresses/${address._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger"
                disabled={deletingId === address._id}
                onClick={() => handleDelete(address._id)}
              >
                {deletingId === address._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === address._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default AddressList

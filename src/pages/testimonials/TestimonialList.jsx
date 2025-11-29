import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { LuPencilLine, LuPlus, LuStar, LuTrash2, LuMessageSquareQuote } from 'react-icons/lu'
import { toast } from 'react-toastify'
import {
  deleteTestimonial,
  fetchTestimonials,
} from '../../features/testimonials/testimonialSlice'

const TestimonialList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.testimonials)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTestimonials())
    }
  }, [status, dispatch])

  const handleDelete = async (id) => {
    setDeletingId(id)
    const result = await dispatch(deleteTestimonial(id))
    if (deleteTestimonial.fulfilled.match(result)) {
      toast.success('Testimonial deleted')
    } else {
      toast.error(result.payload || 'Failed to delete testimonial')
    }
    setDeletingId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Social Proof</p>
          <h2>Testimonials</h2>
          <p className="muted">Manage client stories, ratings, and avatars.</p>
        </div>
        <Link className="primary-button" to="/testimonials/new">
          <LuPlus size={16} />
          New Testimonial
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading testimonials...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((item) => (
          <article key={item._id} className="card-row blog-card">
            <div className="blog-thumb">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.fullName} /> : <div className="thumb-placeholder" />}
            </div>
            <div className="blog-body">
              <div className="blog-head">
                <div>
                  <p className="card-title">{item.fullName}</p>
                  <p className="muted">{item.message}</p>
                </div>
                <p className="pill">
                  <LuStar size={14} /> {item.rating}/5
                </p>
              </div>
              <div className="blog-meta">
                <span><LuMessageSquareQuote size={14} /> {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '--'}</span>
              </div>
            </div>
            <div className="card-actions">
              <Link className="ghost-button ghost-button--solid" to={`/testimonials/${item._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger ghost-button--solid"
                disabled={deletingId === item._id}
                onClick={() => handleDelete(item._id)}
              >
                {deletingId === item._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === item._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default TestimonialList

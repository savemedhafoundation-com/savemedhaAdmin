import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu'
import { fetchTreatmentFaqs } from '../../features/treatmentFaqs/treatmentFaqSlice'
import { fetchTreatments } from '../../features/treatments/treatmentSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const TreatmentFaqList = () => {
  const dispatch = useDispatch()
  const { items: faqs, status, error } = useSelector((state) => state.treatmentFaqs)
  const { items: treatments, status: treatmentStatus } = useSelector((state) => state.treatments)
  const [filters, setFilters] = useState({ title: '', q: '' })
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (treatmentStatus === 'idle') {
      dispatch(fetchTreatments())
    }
  }, [treatmentStatus, dispatch])

  useEffect(() => {
    dispatch(fetchTreatmentFaqs({ title: filters.title, q: filters.q }))
  }, [dispatch, filters])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Treatment FAQs</p>
          <h2>FAQs by Treatment</h2>
          <p className="muted">Search FAQs and filter by treatment title.</p>
        </div>
        <Link className="primary-button" to="/treatment-faqs/new">
          <LuPlus size={16} />
          New FAQ
        </Link>
      </div>

      <div className="card-row" style={{ marginBottom: '1rem', gap: '1rem' }}>
        <label className="form-field" style={{ flex: 1 }}>
          <span>Treatment title</span>
          <select
            value={filters.title}
            onChange={(e) => setFilters((prev) => ({ ...prev, title: e.target.value }))}
          >
            <option value="">All treatments</option>
            {treatments.map((treatment) => (
              <option key={treatment._id} value={treatment.title}>
                {treatment.title}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field" style={{ flex: 1 }}>
          <span>Search</span>
          <div className="input-with-icon">
            <LuSearch size={16} />
            <input
              type="text"
              placeholder="Search question/answer"
              value={filters.q}
              onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            />
          </div>
        </label>
      </div>

      {status === 'loading' ? <p className="muted">Loading FAQs...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {faqs.map((faq) => (
          <article key={faq._id} className="card-row blog-card">
            <div className="blog-body">
              <p className="card-title">{faq.question}</p>
              <p className="muted">Treatment: {faq.title}</p>
              <p className="muted" style={{ marginTop: '8px' }}>
                {faq.answer}
              </p>
              {faq.nitprospective ? (
                <p className="muted" style={{ marginTop: '4px' }}>
                  Nitro Prospective: {faq.nitprospective}
                </p>
              ) : null}
              {faq.link ? (
                <p className="muted" style={{ marginTop: '4px' }}>
                  Link: {faq.link}
                </p>
              ) : null}
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/treatment-faqs/${faq._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger"
                disabled={deletingId === faq._id}
                onClick={async () => {
                  setDeletingId(faq._id)
                  try {
                    await api.delete(`/treatment-faqs/${faq._id}`)
                    toast.success('FAQ deleted')
                    dispatch(fetchTreatmentFaqs({ title: filters.title, q: filters.q }))
                  } catch (err) {
                    toast.error(err?.response?.data?.message || 'Failed to delete FAQ')
                  } finally {
                    setDeletingId(null)
                  }
                }}
              >
                {deletingId === faq._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === faq._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default TreatmentFaqList

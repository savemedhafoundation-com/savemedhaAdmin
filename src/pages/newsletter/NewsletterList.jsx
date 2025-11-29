import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LuCalendarClock, LuMail, LuPencilLine, LuPlus, LuTrash2, LuDownload } from 'react-icons/lu'
import { toast } from 'react-toastify'
import {
  createNewsletter,
  deleteNewsletter,
  fetchNewsletters,
  updateNewsletter,
} from '../../features/newsletter/newsletterSlice'
import * as XLSX from 'xlsx'

const NewsletterList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.newsletter)
  const [editingId, setEditingId] = useState(null)
  const [formEmail, setFormEmail] = useState('')
  const [loadingId, setLoadingId] = useState(null)

  const handleExport = () => {
    if (!items.length) {
      toast.info('No subscribers to export')
      return
    }
    const data = items.map((sub) => ({
      Email: sub.email,
      SubscribedAt: sub.createdAt ? new Date(sub.createdAt).toLocaleString() : '',
    }))
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscribers')
    XLSX.writeFile(workbook, `savemedha-newsletter-${Date.now()}.xlsx`)
    toast.success('Exported to Excel')
  }

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNewsletters())
    }
  }, [status, dispatch])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!formEmail) return
    setLoadingId('create')
    const result = await dispatch(createNewsletter({ email: formEmail }))
    if (createNewsletter.fulfilled.match(result)) {
      toast.success('Subscriber added')
      setFormEmail('')
    } else {
      toast.error(result.payload || 'Failed to add subscriber')
    }
    setLoadingId(null)
  }

  const handleUpdate = async (id, email) => {
    setLoadingId(id)
    const result = await dispatch(updateNewsletter({ id, email }))
    if (updateNewsletter.fulfilled.match(result)) {
      toast.success('Subscriber updated')
      setEditingId(null)
    } else {
      toast.error(result.payload || 'Failed to update subscriber')
    }
    setLoadingId(null)
  }

  const handleDelete = async (id) => {
    setLoadingId(id)
    const result = await dispatch(deleteNewsletter(id))
    if (deleteNewsletter.fulfilled.match(result)) {
      toast.success('Subscriber removed')
    } else {
      toast.error(result.payload || 'Failed to delete subscriber')
    }
    setLoadingId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Audience</p>
          <h2>Newsletter Subscribers</h2>
          <p className="muted">Manage emails captured via newsletter signups.</p>
        </div>
        <button className="ghost-button ghost-button--solid" type="button" onClick={handleExport}>
          <LuDownload size={16} />
          Export Excel
        </button>
      </div>

      <form className="card-row" onSubmit={handleCreate}>
        <div className="blog-body">
          <p className="card-title">Add subscriber</p>
          <div className="form-field">
            <input
              type="email"
              placeholder="user@example.com"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="card-actions">
          <button className="primary-button" type="submit" disabled={loadingId === 'create'}>
            {loadingId === 'create' ? <span className="spinner" /> : <LuPlus size={16} />}
            {loadingId === 'create' ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      {status === 'loading' ? <p className="muted">Loading subscribers...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((sub) => {
          const isEditing = editingId === sub._id
          const [localEmail] = isEditing ? [] : []
          return (
            <article key={sub._id} className="card-row">
              <div>
                <p className="card-title">
                  <LuMail size={14} /> {sub.email}
                </p>
                <p className="muted">
                  <LuCalendarClock size={14} />{' '}
                  {sub.createdAt ? new Date(sub.createdAt).toLocaleString() : '--'}
                </p>
                {isEditing ? (
                  <div className="form-field" style={{ marginTop: '8px' }}>
                    <input
                      type="email"
                      defaultValue={sub.email}
                      onChange={(e) => setFormEmail(e.target.value)}
                    />
                  </div>
                ) : null}
              </div>
              <div className="card-actions">
                {isEditing ? (
                  <>
                    <button
                      className="primary-button"
                      type="button"
                      disabled={loadingId === sub._id}
                      onClick={() => handleUpdate(sub._id, formEmail || sub.email)}
                    >
                      {loadingId === sub._id ? <span className="spinner" /> : <LuPencilLine size={16} />}
                      {loadingId === sub._id ? 'Saving...' : 'Save'}
                    </button>
                    <button className="ghost-button" type="button" onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button className="ghost-button ghost-button--solid" type="button" onClick={() => setEditingId(sub._id)}>
                      <LuPencilLine size={16} />
                      Edit
                    </button>
                    <button
                      className="ghost-button danger ghost-button--solid"
                      type="button"
                      disabled={loadingId === sub._id}
                      onClick={() => handleDelete(sub._id)}
                    >
                      {loadingId === sub._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                      {loadingId === sub._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default NewsletterList

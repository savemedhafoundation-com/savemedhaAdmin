import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuClock4, LuPencilLine, LuPhone, LuPlus, LuTrash2, LuUserRound, LuStickyNote, LuDownload } from 'react-icons/lu'
import { toast } from 'react-toastify'
import { VALID_STATUSES, deleteCallback, fetchCallbacks, updateCallback } from '../../features/callbacks/callbackSlice'
import * as XLSX from 'xlsx'

const CallbackList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.callbacks)
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const handleExport = () => {
    if (!items.length) {
      toast.info('No callbacks to export')
      return
    }
    const data = items.map((item) => ({
      Name: item.fullName,
      Phone: item.phoneNumber,
      Description: item.description || '',
      Status: item.status,
      AdminComment: item.adminComment || '',
      CreatedAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Callbacks')
    XLSX.writeFile(wb, `savemedha-callbacks-${Date.now()}.xlsx`)
    toast.success('Exported callbacks to Excel')
  }

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCallbacks())
    }
  }, [status, dispatch])

  const handleStatusChange = async (id, nextStatus) => {
    setUpdatingId(id)
    const result = await dispatch(updateCallback({ id, data: { status: nextStatus } }))
    if (updateCallback.fulfilled.match(result)) {
      toast.success('Status updated')
    } else {
      toast.error(result.payload || 'Failed to update status')
    }
    setUpdatingId(null)
  }

  const handleAdminComment = async (id, adminComment) => {
    setUpdatingId(id)
    const result = await dispatch(updateCallback({ id, data: { adminComment } }))
    if (updateCallback.fulfilled.match(result)) {
      toast.success('Comment saved')
    } else {
      toast.error(result.payload || 'Failed to save comment')
    }
    setUpdatingId(null)
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    const result = await dispatch(deleteCallback(id))
    if (deleteCallback.fulfilled.match(result)) {
      toast.success('Callback deleted')
    } else {
      toast.error(result.payload || 'Failed to delete callback')
    }
    setDeletingId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Leads</p>
          <h2>Callback Requests</h2>
          <p className="muted">Track inbound requests, update status, and leave admin notes.</p>
        </div>
        <div className="card-actions">
          <button className="ghost-button ghost-button--solid" type="button" onClick={handleExport}>
            <LuDownload size={16} />
            Export Excel
          </button>
          <Link className="primary-button" to="/requestcallbacks/new">
            <LuPlus size={16} />
            New Callback
          </Link>
        </div>
      </div>

      {status === 'loading' ? <p className="muted">Loading callbacks...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((item) => (
          <article key={item._id} className="card-row blog-card">
            <div className="blog-body">
              <div className="blog-head">
                <div>
                  <p className="card-title">
                    <LuUserRound size={14} /> {item.fullName}
                  </p>
                  <p className="muted">
                    <LuPhone size={14} /> {item.phoneNumber}
                  </p>
                  {item.description ? <p className="muted">{item.description}</p> : null}
                </div>
                <div className="pill">{item.status}</div>
              </div>
              <div className="blog-meta">
                <span>
                  <LuClock4 size={14} /> {item.createdAt ? new Date(item.createdAt).toLocaleString() : '--'}
                </span>
                {item.adminComment ? (
                  <span>
                    <LuStickyNote size={14} /> {item.adminComment}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="card-actions callback-actions">
              <div className="action-cell">
                <p className="action-label">Status</p>
                <select
                  value={item.status}
                  onChange={(e) => handleStatusChange(item._id, e.target.value)}
                  disabled={updatingId === item._id}
                >
                  {VALID_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="action-cell">
                <p className="action-label">Admin note</p>
                <button
                  className="ghost-button ghost-button--solid"
                  type="button"
                  disabled={updatingId === item._id}
                  onClick={() => {
                    const note = prompt('Admin comment', item.adminComment || '')
                    if (note !== null) handleAdminComment(item._id, note)
                  }}
                >
                  <LuPencilLine size={16} />
                  Comment
                </button>
              </div>

              {/* <div className="action-cell">
                <p className="action-label">Remove</p>
                <button
                  className="ghost-button danger ghost-button--solid"
                  disabled={deletingId === item._id}
                  onClick={() => handleDelete(item._id)}
                >
                  {deletingId === item._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                  {deletingId === item._id ? 'Deleting...' : 'Delete'}
                </button>
              </div> */}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default CallbackList

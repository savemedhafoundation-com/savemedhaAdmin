import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LuMail, LuPhone, LuTrash2, LuUser, LuCheck } from 'react-icons/lu'
import { fetchContacts, updateContact } from '../../features/contacts/contactSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const ContactList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.contacts)
  console.log("items contact", items);
  const [deletingId, setDeletingId] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchContacts())
    }
  }, [status, dispatch])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/contact-us/${id}`)
      toast.success('Contact removed')
      dispatch(fetchContacts())
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete contact')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Contacts</p>
          <h2>Contact Submissions</h2>
          <p className="muted">View and manage messages from the contact form.</p>
        </div>
      </div>

      {status === 'loading' ? <p className="muted">Loading contacts...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((contact) => (
          <article key={contact._id} className="card-row blog-card">
            <div className="blog-body">
              <p className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuUser size={16} />
                {contact.fullname || '—'}
              </p>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuPhone size={14} />
                <span>{contact.phone}</span>
              </p>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuMail size={14} />
                <span>{contact.email}</span>
              </p>
              <p className="muted" style={{ marginTop: '8px' }}>{contact.comments}</p>
              {contact.createdAt ? (
                <p className="muted" style={{ marginTop: '6px', fontSize: '0.9rem' }}>
                  {new Date(contact.createdAt).toLocaleString()}
                </p>
              ) : null}
            </div>
            <div className="card-actions">
              <label className="form-field" style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                <input
                  type="checkbox"
                  checked={Boolean(contact.iscontacted)}
                  onChange={async (e) => {
                    const value = e.target.checked
                    setUpdatingId(contact._id)
                    try {
                      await dispatch(updateContact({ id: contact._id, data: { iscontacted: value } })).unwrap()
                      await dispatch(fetchContacts())
                      toast.success(value ? 'Marked contacted' : 'Marked not contacted')
                    } catch (err) {
                      toast.error(err || 'Failed to update status')
                    } finally {
                      setUpdatingId(null)
                    }
                  }}
                  disabled={updatingId === contact._id}
                />
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LuCheck size={14} color={contact.iscontacted ? '#22c55e' : '#94a3b8'} />
                  {contact.iscontacted ? 'Contacted' : 'Not contacted'}
                </span>
              </label>
              <button
                className="ghost-button danger"
                disabled={deletingId === contact._id}
                onClick={() => handleDelete(contact._id)}
              >
                {deletingId === contact._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === contact._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ContactList

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuDownload, LuPencilLine, LuPlus, LuTrash2 } from 'react-icons/lu'
import { fetchEbooks, deleteEbook } from '../../features/ebooks/ebookSlice'
import { toast } from 'react-toastify'

const EbookList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.ebooks)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchEbooks())
    }
  }, [status, dispatch])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await dispatch(deleteEbook(id)).unwrap()
      toast.success('Ebook deleted')
    } catch (err) {
      toast.error(err || 'Failed to delete ebook')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Ebooks</p>
          <h2>Ebook Library</h2>
          <p className="muted">Manage uploaded ebooks, banners, and authors.</p>
        </div>
        <Link className="primary-button" to="/ebooks/new">
          <LuPlus size={16} />
          New Ebook
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading ebooks...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((ebook) => (
          <article key={ebook._id} className="card-row blog-card">
            <div className="blog-thumb">
              {ebook.imageUrl ? <img src={ebook.imageUrl} alt={ebook.title} /> : <div className="thumb-placeholder" />}
            </div>
            <div className="blog-body">
              <p className="card-title">{ebook.title}</p>
              {ebook.authors?.length ? (
                <p className="muted">By: {ebook.authors.join(', ')}</p>
              ) : null}
              <p className="muted" style={{ marginTop: '6px' }}>{ebook.description}</p>
              {ebook.tags?.length ? (
                <p className="muted" style={{ marginTop: '6px' }}>Tags: {ebook.tags.join(', ')}</p>
              ) : null}
              {ebook.pdfUrl ? (
                <a className="muted" href={ebook.pdfUrl} target="_blank" rel="noreferrer" style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <LuDownload size={14} />
                  View / Download PDF
                </a>
              ) : null}
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/ebooks/${ebook._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger"
                disabled={deletingId === ebook._id}
                onClick={() => handleDelete(ebook._id)}
              >
                {deletingId === ebook._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === ebook._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default EbookList

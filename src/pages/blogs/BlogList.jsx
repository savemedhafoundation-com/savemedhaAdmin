import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuCalendarClock, LuMessageCircle, LuPencilLine, LuPlus, LuTag, LuTrash2, LuUserRound } from 'react-icons/lu'
import { fetchBlogs } from '../../features/blogs/blogSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import { useState } from 'react'

const BlogList = () => {
  const [deletingId, setDeletingId] = useState(null)
  const dispatch = useDispatch()
  const { items: blogs, status, error } = useSelector((state) => state.blogs)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogs())
    }
  }, [status, dispatch])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/blogs/${id}`)
      toast.success('Blog deleted')
      dispatch(fetchBlogs())
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete blog')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Content</p>
          <h2>Blogs</h2>
          <p className="muted">Create, edit, and manage blog content.</p>
        </div>
        <Link className="primary-button" to="/blogs/new">
          <LuPlus size={16} />
          New Blog
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading blogs...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {blogs.map((blog) => (
          <article key={blog._id} className="card-row blog-card">
            <div className="blog-thumb">
              {blog.imageUrl ? <img src={blog.imageUrl} alt={blog.title} /> : <div className="thumb-placeholder" />}
            </div>
            <div className="blog-body">
              <div className="blog-head">
                <div>
                  <p className="card-title">{blog.title}</p>
                  <p className="muted">{blog.description?.slice(0, 180)}{blog.description?.length > 180 ? '…' : ''}</p>
                </div>
                <p className="pill">{blog.category || 'N/A'}</p>
              </div>

              <div className="blog-meta">
                <span><LuUserRound size={14} /> {blog.writtenBy || 'Unknown'}</span>
                <span><LuCalendarClock size={14} /> {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : '--'}</span>
                <span><LuMessageCircle size={14} /> {blog.comments?.length || 0} comments</span>
                <span><LuTag size={14} /> {(blog.metadata || []).join(', ') || 'No tags'}</span>
              </div>

              {blog.comments?.length ? (
                <div className="blog-comments">
                  {blog.comments.map((comment) => (
                    <div key={comment._id} className="comment-chip">
                      <div className="comment-name">{comment.name || 'Anonymous'}</div>
                      <div className="comment-text">{comment.comment}</div>
                      <div className="comment-date">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : '--'}</div>
                      {/* phone number of the user */}
                      <div className="comment-phone">{comment.phoneNumber}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="card-actions">
              <Link className="ghost-button ghost-button--solid" to={`/blogs/${blog._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger ghost-button--solid"
                disabled={deletingId === blog._id}
                onClick={() => handleDelete(blog._id)}
              >
                {deletingId === blog._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === blog._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default BlogList

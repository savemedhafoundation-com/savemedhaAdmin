import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuTrash2 } from 'react-icons/lu'
import { fetchBlogs } from '../../features/blogs/blogSlice'

const BlogList = () => {
  const dispatch = useDispatch()
  const { items: blogs, status, error } = useSelector((state) => state.blogs)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogs())
    }
  }, [status, dispatch])

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
          <article key={blog._id} className="card-row">
            <div>
              <p className="card-title">{blog.title}</p>
              <p className="muted">{blog.description}</p>
              <p className="pill">{blog.category || 'N/A'}</p>
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/blogs/${blog._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button className="ghost-button danger" disabled>
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

export default BlogList

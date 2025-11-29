import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuTrash2 } from 'react-icons/lu'
import { deleteBlog } from '../../features/blogs/blogSlice'

const BlogList = () => {
  const blogs = useSelector((state) => state.blogs.items)
  const dispatch = useDispatch()

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

      <div className="card-list">
        {blogs.map((blog) => (
          <article key={blog.id} className="card-row">
            <div>
              <p className="card-title">{blog.title}</p>
              <p className="muted">{blog.summary}</p>
              <p className="pill">{blog.status}</p>
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/blogs/${blog.id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button className="ghost-button danger" onClick={() => dispatch(deleteBlog(blog.id))}>
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

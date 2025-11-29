import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { addBlog, updateBlog } from '../../features/blogs/blogSlice'

const BlogForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const blog = useSelector((state) => state.blogs.items.find((item) => item.id === id))

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      summary: '',
      status: 'Draft',
      content: '',
    },
  })

  useEffect(() => {
    if (blog) {
      reset(blog)
    }
  }, [blog, reset])

  const onSubmit = (values) => {
    if (id && blog) {
      dispatch(updateBlog({ id, data: values }))
    } else {
      dispatch(addBlog(values))
    }
    navigate('/blogs')
  }

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Content</p>
          <h2>{id ? 'Edit Blog' : 'Create Blog'}</h2>
          <p className="muted">Use a clear headline and concise summary.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Blog title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>Summary</span>
          <textarea rows="2" placeholder="Short preview copy" {...register('summary', { required: true })} />
        </label>

        <label className="form-field">
          <span>Status</span>
          <select {...register('status')}>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
          </select>
        </label>

        <label className="form-field">
          <span>Content</span>
          <textarea rows="6" placeholder="Main content" {...register('content')} />
        </label>

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/blogs')}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            {id ? 'Save changes' : 'Create blog'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BlogForm

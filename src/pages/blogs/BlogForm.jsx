import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBlogs } from '../../features/blogs/blogSlice'
import api from '../../api/axios'

const BlogForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.blogs)
  const blog = items.find((item) => item._id === id)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      writtenBy: '',
      metadata: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogs())
    }
    if (blog) {
      reset(blog)
    }
  }, [blog, reset, status, dispatch])

  const onSubmit = async (values) => {
    setSubmitError('')
    if (!id) {
      setSubmitError('Creating blogs requires image upload; please use backend endpoint.')
      return
    }
    try {
      await api.put(`/blogs/${id}`, values)
      dispatch(fetchBlogs())
      navigate('/blogs')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Failed to update blog')
    }
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
          <span>Description</span>
          <textarea rows="4" placeholder="Short preview copy" {...register('description', { required: true })} />
        </label>

        <label className="form-field">
          <span>Category</span>
          <input type="text" placeholder="cancer | kidney | heart | nerve | spinal | other" {...register('category')} />
        </label>

        <label className="form-field">
          <span>Written By</span>
          <input type="text" placeholder="Author name" {...register('writtenBy')} />
        </label>

        <label className="form-field">
          <span>Metadata</span>
          <input type="text" placeholder="comma separated tags" {...register('metadata')} />
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

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

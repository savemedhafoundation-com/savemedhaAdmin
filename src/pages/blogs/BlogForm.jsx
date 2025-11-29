import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBlogs } from '../../features/blogs/blogSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const VALID_CATEGORIES = ['cancer', 'kidney', 'heart', 'nerve', 'spinal', 'other']

const BlogForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.blogs)
  const blog = items.find((item) => item._id === id)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'cancer',
      writtenBy: '',
      metadata: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogs())
    }
    if (blog) {
      reset({
        ...blog,
        metadata: Array.isArray(blog.metadata) ? blog.metadata.join(', ') : blog.metadata || '',
      })
    }
  }, [blog, reset, status, dispatch])

  const onSubmit = async (values) => {
    setSubmitError('')
    if (!id && !selectedFile) {
      setSubmitError('Image is required to create a blog.')
      return
    }
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('description', values.description)
    formData.append('category', values.category)
    formData.append('writtenBy', values.writtenBy)
    formData.append('metadata', values.metadata || '')

    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    try {
      if (id) {
        await api.put(`/blogs/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Blog updated')
      } else {
        await api.post('/blogs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Blog created')
      }
      dispatch(fetchBlogs())
      navigate('/blogs')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Failed to save blog')
      toast.error(error?.response?.data?.message || 'Failed to save blog')
    } finally {
      setIsSubmitting(false)
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
          <select {...register('category', { required: true })}>
            {VALID_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Written By</span>
          <input type="text" placeholder="Author name" {...register('writtenBy')} />
        </label>

        <label className="form-field">
          <span>Metadata</span>
          <input type="text" placeholder="comma separated tags" {...register('metadata')} />
        </label>

        <label className="form-field">
          <span>Cover Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          {blog?.imageUrl ? <p className="form-hint"><span className='text-bold'>Current Image:</span> {blog.imageUrl}</p> : null}
          {selectedFile ? <p className="form-hint"><span className='text-bold'>New Image:</span> {selectedFile.name}</p> : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/blogs')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create blog'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BlogForm

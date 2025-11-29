import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchServices } from '../../features/services/serviceSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const ServiceForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.services)
  const service = items.find((item) => item._id === id)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchServices())
    }
    if (service) {
      reset(service)
    }
  }, [service, reset, status, dispatch])

  const onSubmit = async (values) => {
    setSubmitError('')
    if (!id && !selectedFile) {
      setSubmitError('Image is required to create a service.')
      return
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description)
      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      if (id) {
        await api.put(`/services/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Service updated')
      } else {
        await api.post('/services', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Service created')
      }
      dispatch(fetchServices())
      navigate('/services')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Failed to update service')
      toast.error(error?.response?.data?.message || 'Failed to update service')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Services</p>
          <h2>{id ? 'Edit Service' : 'Create Service'}</h2>
          <p className="muted">Define offering details, pricing, and status.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Service title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea rows="5" placeholder="What is included?" {...register('description')} />
        </label>

        <label className="form-field">
          <span>Cover Image</span>
          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          {service?.imageUrl ? <p className="form-hint"><span className='text-bold'>Current Image:</span> {service.imageUrl}</p> : null}
          {selectedFile ? <p className="form-hint"><span className='text-bold'>New Image:</span> {selectedFile.name}</p> : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/services')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create service (requires image via API)'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ServiceForm

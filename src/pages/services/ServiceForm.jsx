import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchServices } from '../../features/services/serviceSlice'
import api from '../../api/axios'

const ServiceForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.services)
  const service = items.find((item) => item._id === id)
  const [submitError, setSubmitError] = useState('')

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
    if (!id) {
      setSubmitError('Creating services requires an image upload; please use backend endpoint.')
      return
    }
    try {
      await api.put(`/services/${id}`, values)
      dispatch(fetchServices())
      navigate('/services')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Failed to update service')
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

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/services')}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            {id ? 'Save changes' : 'Create service (requires image via API)'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ServiceForm

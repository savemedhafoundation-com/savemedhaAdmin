import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { addService, updateService } from '../../features/services/serviceSlice'

const ServiceForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const service = useSelector((state) => state.services.items.find((item) => item.id === id))

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      price: 0,
      status: 'Draft',
      description: '',
    },
  })

  useEffect(() => {
    if (service) {
      reset(service)
    }
  }, [service, reset])

  const onSubmit = (values) => {
    if (id && service) {
      dispatch(updateService({ id, data: values }))
    } else {
      dispatch(addService({ ...values, price: Number(values.price) }))
    }
    navigate('/services')
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
          <span>Name</span>
          <input type="text" placeholder="Service name" {...register('name', { required: true })} />
        </label>

        <label className="form-field">
          <span>Price</span>
          <input type="number" step="0.01" min="0" {...register('price', { required: true })} />
        </label>

        <label className="form-field">
          <span>Status</span>
          <select {...register('status')}>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
          </select>
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea rows="5" placeholder="What is included?" {...register('description')} />
        </label>

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/services')}>
            Cancel
          </button>
          <button className="primary-button" type="submit">
            {id ? 'Save changes' : 'Create service'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ServiceForm

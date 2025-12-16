import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchAddresses, createAddress, updateAddress } from '../../features/addresses/addressSlice'
import { toast } from 'react-toastify'

const AddressForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.addresses)
  const address = items.find((item) => item._id === id)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      address: '',
      phone: '',
      mapLocation: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAddresses())
    }
    if (address) {
      reset({
        title: address.title,
        address: address.address,
        phone: address.phone,
        mapLocation: address.mapLocation,
      })
    }
  }, [status, dispatch, address, reset])

  const onSubmit = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      if (id) {
        await dispatch(updateAddress({ id, data: values })).unwrap()
        toast.success('Address updated')
      } else {
        await dispatch(createAddress(values)).unwrap()
        toast.success('Address created')
      }
      navigate('/addresses')
    } catch (error) {
      const message = error || 'Failed to save address'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Addresses</p>
          <h2>{id ? 'Edit Address' : 'Create Address'}</h2>
          <p className="muted">Manage office locations and contact details.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Office title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>Address</span>
          <textarea rows="3" placeholder="Full address" {...register('address', { required: true })} />
        </label>

        <label className="form-field">
          <span>Phone</span>
          <input type="text" placeholder="Contact phone" {...register('phone', { required: true })} />
        </label>

        <label className="form-field">
          <span>Map Location URL</span>
          <input type="url" placeholder="https://maps.google.com/..." {...register('mapLocation', { required: true })} />
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/addresses')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create address'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddressForm

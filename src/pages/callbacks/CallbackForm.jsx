import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createCallback } from '../../features/callbacks/callbackSlice'

const CallbackForm = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      description: '',
    },
  })

  const onSubmit = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)
    const result = await dispatch(createCallback(values))
    if (createCallback.fulfilled.match(result)) {
      toast.success('Callback created')
      navigate('/callbacks')
    } else {
      const msg = result.payload || 'Failed to create callback'
      setSubmitError(msg)
      toast.error(msg)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Leads</p>
          <h2>Create a Callback Request</h2>
          <p className="muted">Log a new inbound request for follow-up.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Full Name</span>
          <input type="text" placeholder="Customer name" {...register('fullName', { required: true })} />
        </label>

        <label className="form-field">
          <span>Phone Number</span>
          <input type="tel" placeholder="+91..." {...register('phoneNumber', { required: true })} />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea rows="4" placeholder="Notes from the lead" {...register('description')} />
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/callbacks')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : 'Create callback Request'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CallbackForm

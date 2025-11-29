import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createTestimonial, fetchTestimonials, updateTestimonial } from '../../features/testimonials/testimonialSlice'

const TestimonialForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.testimonials)
  const testimonial = items.find((item) => item._id === id)

  const [selectedFile, setSelectedFile] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: '',
      rating: 5,
      message: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTestimonials())
    }
    if (testimonial) {
      reset({
        fullName: testimonial.fullName || '',
        rating: testimonial.rating || 5,
        message: testimonial.message || '',
      })
    }
  }, [status, testimonial, dispatch, reset])

  const onSubmit = async (values) => {
    setSubmitError('')
    if (!id && !selectedFile) {
      setSubmitError('Image is required to create a testimonial.')
      return
    }

    const formData = new FormData()
    formData.append('fullName', values.fullName)
    formData.append('rating', values.rating)
    formData.append('message', values.message)
    if (selectedFile) {
      formData.append('image', selectedFile)
    }

    setIsSubmitting(true)
    try {
      if (id) {
        const result = await dispatch(updateTestimonial({ id, formData }))
        if (updateTestimonial.fulfilled.match(result)) {
          toast.success('Testimonial updated')
        } else {
          throw new Error(result.payload)
        }
      } else {
        const result = await dispatch(createTestimonial(formData))
        if (createTestimonial.fulfilled.match(result)) {
          toast.success('Testimonial created')
        } else {
          throw new Error(result.payload)
        }
      }
      navigate('/testimonials')
    } catch (error) {
      const msg = error?.message || 'Failed to save testimonial'
      setSubmitError(msg)
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Social Proof</p>
          <h2>{id ? 'Edit Testimonial' : 'Create Testimonial'}</h2>
          <p className="muted">Showcase patient stories with photo and rating.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Full Name</span>
          <input type="text" placeholder="Person name" {...register('fullName', { required: true })} />
        </label>

        <label className="form-field">
          <span>Rating (1-5)</span>
          <input type="number" min="1" max="5" step="1" {...register('rating', { required: true })} />
        </label>

        <label className="form-field">
          <span>Message</span>
          <textarea rows="4" placeholder="What did they say?" {...register('message', { required: true })} />
        </label>

        <label className="form-field">
          <span>Avatar Image</span>
          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          {testimonial?.imageUrl ? <p className="form-hint">Current: {testimonial.imageUrl}</p> : null}
          {selectedFile ? <p className="form-hint">New: {selectedFile.name}</p> : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/testimonials')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create testimonial'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TestimonialForm

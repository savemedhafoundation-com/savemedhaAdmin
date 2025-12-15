import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchTreatments } from '../../features/treatments/treatmentSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const TreatmentFaqForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items: treatments, status: treatmentStatus } = useSelector((state) => state.treatments)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      question: '',
      answer: '',
      nitprospective: '',
      link: '',
    },
  })

  useEffect(() => {
    if (treatmentStatus === 'idle') {
      dispatch(fetchTreatments())
    }
  }, [treatmentStatus, dispatch])

  useEffect(() => {
    const loadFaq = async () => {
      if (!id) return
      try {
        const { data } = await api.get(`/treatment-faqs/${id}`)
        reset({
          title: data.title,
          question: data.question,
          answer: data.answer,
          nitprospective: data.nitprospective,
          link: data.link,
        })
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Failed to load FAQ')
      }
    }
    loadFaq()
  }, [id, reset])

  const onSubmit = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      if (id) {
        await api.patch(`/treatment-faqs/${id}`, values)
        toast.success('FAQ updated')
      } else {
        await api.post('/treatment-faqs', values)
        toast.success('FAQ created')
      }
      navigate('/treatment-faqs')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to save FAQ'
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
          <p className="eyebrow">Treatment FAQs</p>
          <h2>{id ? 'Edit FAQ' : 'Create FAQ'}</h2>
          <p className="muted">Attach FAQs to a treatment title (must exist in Treatments).</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Treatment title</span>
          <select {...register('title', { required: true })} defaultValue="">
            <option value="" disabled>
              Select treatment
            </option>
            {treatments.map((treatment) => (
              <option key={treatment._id} value={treatment.title}>
                {treatment.title}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Question</span>
          <input type="text" placeholder="FAQ question" {...register('question', { required: true })} />
        </label>

        <label className="form-field">
          <span>Answer</span>
          <textarea rows="4" placeholder="Answer" {...register('answer', { required: true })} />
        </label>

        <label className="form-field">
          <span>Nit Prospective</span>
          <input type="text" placeholder="Nit Prospective" {...register('nitprospective', { required: true })} />
        </label>

        <label className="form-field">
          <span>Link</span>
          <input type="text" placeholder="Reference link" {...register('link', { required: true })} />
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/treatment-faqs')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create FAQ'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TreatmentFaqForm

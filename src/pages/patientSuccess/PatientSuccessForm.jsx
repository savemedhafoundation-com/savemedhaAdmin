import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchPatientSuccess } from '../../features/patientSuccess/patientSuccessSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const PatientSuccessForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.patientSuccess)
  const story = items.find((item) => item._id === id)

  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      youtubeUrl: '',
      duration: '',
      description: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchPatientSuccess())
    }
    if (story) {
      reset({
        title: story.title,
        youtubeUrl: story.youtubeUrl,
        duration: story.duration,
        description: story.description,
      })
    }
  }, [story, reset, status, dispatch])

  const onSubmit = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      if (id) {
        await api.patch(`/patient-success-stories/${id}`, values)
        toast.success('Story updated')
      } else {
        await api.post('/patient-success-stories', values)
        toast.success('Story created')
      }
      dispatch(fetchPatientSuccess())
      navigate('/patient-success-stories')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to save story'
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
          <p className="eyebrow">Patient Success</p>
          <h2>{id ? 'Edit Success Story' : 'Create Success Story'}</h2>
          <p className="muted">Add a story with title, YouTube URL, duration, and description.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Story title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>YouTube URL</span>
          <input type="url" placeholder="https://youtu.be/..." {...register('youtubeUrl', { required: true })} />
        </label>

        <label className="form-field">
          <span>Duration</span>
          <input type="text" placeholder="mm:ss" {...register('duration', { required: true })} />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea rows="4" placeholder="Short description" {...register('description', { required: true })} />
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/patient-success-stories')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create story'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PatientSuccessForm

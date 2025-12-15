import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchOngoingEvents } from '../../features/ongoingEvents/ongoingEventSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const toLocalInputValue = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

const OngoingEventForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.ongoingEvents)
  const event = items.find((item) => item._id === id)

  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      eventDateTime: '',
      venue: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchOngoingEvents())
    }
    if (event) {
      reset({
        title: event.title,
        description: event.description,
        eventDateTime: toLocalInputValue(event.eventDateTime),
        venue: event.venue,
      })
    }
  }, [event, reset, status, dispatch])

  const onSubmit = async (values) => {
    setSubmitError('')
    if (!id && selectedFiles.length === 0) {
      setSubmitError('At least one image is required to create an ongoing event.')
      return
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description)
      formData.append('eventDateTime', values.eventDateTime)
      formData.append('venue', values.venue)
      selectedFiles.forEach((file) => formData.append('images', file))

      if (id) {
        await api.put(`/ongoing-events/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Event updated')
      } else {
        await api.post('/ongoing-events', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Event created')
      }
      dispatch(fetchOngoingEvents())
      navigate('/ongoing-events')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to save event'
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
          <p className="eyebrow">Events</p>
          <h2>{id ? 'Edit Ongoing Event' : 'Create Ongoing Event'}</h2>
          <p className="muted">Set event details and upload one or more images.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Event title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea rows="4" placeholder="Event description" {...register('description', { required: true })} />
        </label>

        <label className="form-field">
          <span>Date & time</span>
          <input type="datetime-local" {...register('eventDateTime', { required: true })} />
        </label>

        <label className="form-field">
          <span>Venue</span>
          <input type="text" placeholder="Venue" {...register('venue', { required: true })} />
        </label>

        <label className="form-field">
          <span>Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
          />
          {event?.images?.length ? (
            <p className="form-hint">
              <span className="text-bold">Current images:</span> {event.images.length} uploaded
            </p>
          ) : null}
          {selectedFiles.length ? (
            <p className="form-hint">
              <span className="text-bold">New images:</span> {selectedFiles.map((f) => f.name).join(', ')}
            </p>
          ) : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/ongoing-events')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create event'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default OngoingEventForm

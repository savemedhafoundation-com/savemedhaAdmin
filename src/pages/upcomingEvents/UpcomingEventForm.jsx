import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchUpcomingEvents } from '../../features/upcomingEvents/upcomingEventSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const toLocalInputValue = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const tzOffset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16)
}

const UpcomingEventForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.upcomingEvents)
  const event = items.find((item) => item._id === id)

  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

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
      dispatch(fetchUpcomingEvents())
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
    if (!id && !selectedFile) {
      setSubmitError('Banner image is required to create an event.')
      return
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('description', values.description)
      formData.append('eventDateTime', values.eventDateTime)
      formData.append('venue', values.venue)
      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      if (id) {
        await api.put(`/upcoming-events/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Event updated')
      } else {
        await api.post('/upcoming-events', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Event created')
      }
      dispatch(fetchUpcomingEvents())
      navigate('/upcoming-events')
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
          <h2>{id ? 'Edit Upcoming Event' : 'Create Upcoming Event'}</h2>
          <p className="muted">Set event details, schedule, venue, and banner.</p>
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
          <span>Banner image</span>
          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          {event?.imageUrl ? (
            <p className="form-hint">
              <span className="text-bold">Current Image:</span> {event.imageUrl}
            </p>
          ) : null}
          {selectedFile ? (
            <p className="form-hint">
              <span className="text-bold">New Image:</span> {selectedFile.name}
            </p>
          ) : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/upcoming-events')}>
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

export default UpcomingEventForm

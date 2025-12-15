import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchTreatments } from '../../features/treatments/treatmentSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'

const TreatmentForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.treatments)
  const treatment = items.find((item) => item._id === id)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      colorCode: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTreatments())
    }
    if (treatment) {
      reset({
        title: treatment.title,
        colorCode: treatment.colorCode,
      })
    }
  }, [treatment, reset, status, dispatch])

  const onSubmit = async (values) => {
    setSubmitError('')
    if (!id && !selectedFile) {
      setSubmitError('Image is required to create a treatment.')
      return
    }
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('colorCode', values.colorCode)
      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      if (id) {
        await api.put(`/treatments/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Treatment updated')
      } else {
        await api.post('/treatments', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
        toast.success('Treatment created')
      }
      dispatch(fetchTreatments())
      navigate('/treatments')
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to save treatment'
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
          <p className="eyebrow">Treatments</p>
          <h2>{id ? 'Edit Treatment' : 'Create Treatment'}</h2>
          <p className="muted">Add or update a treatment title, color, and image.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Treatment title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>Color code</span>
          <input type="text" placeholder="#12ABCD" {...register('colorCode', { required: true })} />
        </label>

        <label className="form-field">
          <span>Image</span>
          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          {treatment?.image ? (
            <p className="form-hint">
              <span className="text-bold">Current Image:</span> {treatment.image}
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
          <button className="ghost-button" type="button" onClick={() => navigate('/treatments')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create treatment'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default TreatmentForm

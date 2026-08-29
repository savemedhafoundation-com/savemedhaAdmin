import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { fetchEbooks, createEbook, updateEbook } from '../../features/ebooks/ebookSlice'
import { toast } from 'react-toastify'

const MAX_PDF_SIZE = 20 * 1024 * 1024
const MAX_IMAGE_SIZE = 20 * 1024 * 1024

const splitCommaSeparated = (value) =>
  value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []

const validateSelectedFiles = (pdfFile, imageFile) => {
  if (pdfFile) {
    const isPdf = pdfFile.type === 'application/pdf' || pdfFile.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) return 'Please select a valid PDF file.'
    if (pdfFile.size > MAX_PDF_SIZE) return 'The PDF file must be 20 MB or smaller.'
  }

  if (imageFile) {
    if (!imageFile.type.startsWith('image/')) return 'Please select a valid banner image.'
    if (imageFile.size > MAX_IMAGE_SIZE) return 'The banner image must be 20 MB or smaller.'
  }

  return ''
}

const EbookForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.ebooks)
  const ebook = items.find((item) => item._id === id)

  const [pdfFile, setPdfFile] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      authors: '',
      tags: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchEbooks())
    }
    if (ebook) {
      reset({
        title: ebook.title,
        description: ebook.description,
        authors: ebook.authors?.join(', ') || '',
        tags: ebook.tags?.join(', ') || '',
      })
    }
  }, [status, dispatch, ebook, reset])

  const onSubmit = async (values) => {
    setSubmitError('')
    if (!id && !pdfFile) {
      setSubmitError('PDF file is required to create an ebook.')
      return
    }
    if (!id && !imageFile) {
      setSubmitError('Banner image is required to create an ebook.')
      return
    }

    const fileError = validateSelectedFiles(pdfFile, imageFile)
    if (fileError) {
      setSubmitError(fileError)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        title: values.title,
        description: values.description,
        authors: splitCommaSeparated(values.authors),
        tags: splitCommaSeparated(values.tags),
        pdfFile,
        imageFile,
      }

      if (id) {
        await dispatch(updateEbook({ id, payload })).unwrap()
        toast.success('Ebook updated')
      } else {
        await dispatch(createEbook(payload)).unwrap()
        toast.success('Ebook created')
      }
      navigate('/ebooks')
    } catch (error) {
      const message = typeof error === 'string' ? error : error?.message || 'Failed to save ebook'
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
          <p className="eyebrow">Ebooks</p>
          <h2>{id ? 'Edit Ebook' : 'Create Ebook'}</h2>
          <p className="muted">Upload PDF and banner image. Authors and tags accept comma-separated values.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Ebook title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea rows="4" placeholder="Short summary" {...register('description', { required: true })} />
        </label>

        <label className="form-field">
          <span>Authors (comma separated)</span>
          <input type="text" placeholder="Author One, Author Two" {...register('authors')} />
        </label>

        <label className="form-field">
          <span>Tags (comma separated)</span>
          <input type="text" placeholder="health, cancer" {...register('tags')} />
        </label>

        <label className="form-field">
          <span>PDF file</span>
          <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
          {ebook?.pdfUrl ? (
            <p className="form-hint">
              <a href={ebook.pdfUrl} target="_blank" rel="noreferrer">Current PDF</a>
            </p>
          ) : null}
          {pdfFile ? <p className="form-hint">New: {pdfFile.name}</p> : null}
        </label>

        <label className="form-field">
          <span>Banner image</span>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
          {ebook?.imageUrl ? (
            <p className="form-hint">Current: {ebook.imageUrl}</p>
          ) : null}
          {imageFile ? <p className="form-hint">New: {imageFile.name}</p> : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/ebooks')} disabled={isSubmitting}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create ebook'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default EbookForm

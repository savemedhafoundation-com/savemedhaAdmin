import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { fetchEbooks, createEbook, updateEbook } from '../../features/ebooks/ebookSlice'
import { toast } from 'react-toastify'

const MAX_PDF_SIZE = 500 * 1024 * 1024
const MAX_IMAGE_SIZE = 20 * 1024 * 1024

const formatFileSize = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / (1024 ** unitIndex)
  return `${value.toFixed(unitIndex === 0 || value >= 10 ? 0 : 1)} ${units[unitIndex]}`
}

const splitCommaSeparated = (value) =>
  value ? value.split(',').map((item) => item.trim()).filter(Boolean) : []

const validateSelectedFiles = async (pdfFile, imageFile) => {
  if (pdfFile) {
    const hasPdfName = pdfFile.name.toLowerCase().endsWith('.pdf')
    const hasPdfType = !pdfFile.type || pdfFile.type === 'application/pdf'
    if (!hasPdfName || !hasPdfType) return 'Please select a valid PDF file.'
    if (pdfFile.size === 0) return 'The PDF file is empty.'
    if (pdfFile.size > MAX_PDF_SIZE) return 'The PDF file must be 500 MB or smaller.'

    const header = await pdfFile.slice(0, 1024).text()
    if (!header.includes('%PDF-')) return 'The selected file does not contain a valid PDF header.'
  }

  if (imageFile) {
    if (!imageFile.type.startsWith('image/')) return 'Please select a valid banner image.'
    if (imageFile.size === 0) return 'The banner image is empty.'
    if (imageFile.size > MAX_IMAGE_SIZE) return 'The banner image must be 20 MB or smaller.'
  }

  return ''
}

const EbookForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status, uploadProgress } = useSelector((state) => state.ebooks)
  const ebook = items.find((item) => item._id === id)
  const submissionRef = useRef(null)
  const cancelRequestedRef = useRef(false)

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

    const fileError = await validateSelectedFiles(pdfFile, imageFile)
    if (fileError) {
      setSubmitError(fileError)
      return
    }

    cancelRequestedRef.current = false
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

      const submission = id
        ? dispatch(updateEbook({ id, payload }))
        : dispatch(createEbook(payload))
      submissionRef.current = submission

      if (id) {
        await submission.unwrap()
        toast.success('Ebook updated')
      } else {
        await submission.unwrap()
        toast.success('Ebook created')
      }
      navigate('/ebooks')
    } catch (error) {
      if (cancelRequestedRef.current || error?.name === 'AbortError') return
      const message = typeof error === 'string' ? error : error?.message || 'Failed to save ebook'
      setSubmitError(message)
      toast.error(message)
    } finally {
      submissionRef.current = null
      setIsSubmitting(false)
      if (cancelRequestedRef.current) navigate('/ebooks')
    }
  }

  const handleCancel = () => {
    if (!isSubmitting) {
      navigate('/ebooks')
      return
    }

    cancelRequestedRef.current = true
    setSubmitError('Cancelling upload...')
    submissionRef.current?.abort()
  }

  const progressPercentage = Math.max(0, Math.min(100, Math.round(uploadProgress?.percentage || 0)))
  const progressMessage = uploadProgress?.stage === 'saving'
    ? 'PDF uploaded. Saving ebook details...'
    : uploadProgress?.stage === 'uploading'
      ? `Uploading PDF: ${progressPercentage}% (${formatFileSize(uploadProgress.loaded)} of ${formatFileSize(uploadProgress.total)})`
      : 'Preparing secure PDF upload...'

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
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={isSubmitting}
            onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
          />
          <p className="form-hint">PDF files up to 500 MB are supported.</p>
          {ebook?.pdfUrl ? (
            <p className="form-hint">
              <a href={ebook.pdfUrl} target="_blank" rel="noreferrer">Current PDF</a>
            </p>
          ) : null}
          {pdfFile ? <p className="form-hint">New: {pdfFile.name} ({formatFileSize(pdfFile.size)})</p> : null}
        </label>

        <label className="form-field">
          <span>Banner image</span>
          <input
            type="file"
            accept="image/*"
            disabled={isSubmitting}
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          {ebook?.imageUrl ? (
            <p className="form-hint">Current: {ebook.imageUrl}</p>
          ) : null}
          {imageFile ? <p className="form-hint">New: {imageFile.name} ({formatFileSize(imageFile.size)})</p> : null}
        </label>

        {isSubmitting && uploadProgress ? (
          <div className="form-field" aria-live="polite">
            <progress
              aria-label="PDF upload progress"
              max="100"
              value={progressPercentage}
              style={{ width: '100%' }}
            />
            <p className="form-hint">{progressMessage}</p>
          </div>
        ) : null}

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={handleCancel}>
            {isSubmitting ? 'Cancel upload' : 'Cancel'}
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

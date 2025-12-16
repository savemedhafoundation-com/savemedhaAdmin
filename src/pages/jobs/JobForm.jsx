import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { fetchJobs, createJob, updateJob } from '../../features/jobs/jobSlice'
import { toast } from 'react-toastify'

const JOB_TYPES = ['Full-time', 'Part-time', 'Remote']
const JOB_CATEGORIES = [
  'technology',
  'marketing',
  'sales',
  'operations',
  'finance',
  'human-resources',
  'design',
  'product',
  'customer-support',
  'healthcare',
  'education',
  'other',
]
const EXPERIENCE_LEVELS = ['internship', 'entry', 'mid', 'senior', 'lead', 'director', 'executive']

const JobForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.jobs)
  const job = items.find((item) => item._id === id)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: '',
      description: '',
      responsibilities: '',
      requirements: '',
      location: '',
      salary: '',
      education: '',
      position: '',
      jobType: JOB_TYPES[0],
      category: JOB_CATEGORIES[0],
      experienceLevel: EXPERIENCE_LEVELS[0],
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchJobs())
    }
    if (job) {
      reset({
        title: job.title,
        description: job.description,
        responsibilities: job.responsibilities?.join(', ') || '',
        requirements: job.requirements?.join(', ') || '',
        location: job.location || '',
        salary: job.salary || '',
        education: job.education || '',
        position: job.position || '',
        jobType: job.jobType || JOB_TYPES[0],
        category: job.category || JOB_CATEGORIES[0],
        experienceLevel: job.experienceLevel || EXPERIENCE_LEVELS[0],
      })
    }
  }, [status, dispatch, job, reset])

  const onSubmit = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)
    try {
      const payload = {
        title: values.title,
        description: values.description,
        location: values.location,
        salary: values.salary,
        education: values.education,
        position: values.position,
        jobType: values.jobType,
        category: values.category,
        experienceLevel: values.experienceLevel,
        responsibilities: values.responsibilities
          ? values.responsibilities.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
        requirements: values.requirements
          ? values.requirements.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
      }
      if (id) {
        await dispatch(updateJob({ id, data: payload })).unwrap()
        toast.success('Job updated')
      } else {
        await dispatch(createJob(payload)).unwrap()
        toast.success('Job created')
      }
      navigate('/jobs')
    } catch (error) {
      const message = error || 'Failed to save job'
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
          <p className="eyebrow">Jobs</p>
          <h2>{id ? 'Edit Job' : 'Create Job'}</h2>
          <p className="muted">Define job details, requirements, and location.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Job title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>Description</span>
          <textarea rows="4" placeholder="Role description" {...register('description', { required: true })} />
        </label>

        <label className="form-field">
          <span>Position</span>
          <input type="text" placeholder="e.g. Senior Therapist" {...register('position', { required: true })} />
        </label>

        <div className="grid two-col">
          <label className="form-field">
            <span>Location</span>
            <input type="text" placeholder="City / Remote" {...register('location', { required: true })} />
          </label>
          <label className="form-field">
            <span>Salary</span>
            <input type="text" placeholder="Optional" {...register('salary')} />
          </label>
        </div>

        <label className="form-field">
          <span>Education</span>
          <input type="text" placeholder="Required education" {...register('education')} />
        </label>

        <div className="grid three-col">
          <label className="form-field">
            <span>Job Type</span>
            <select {...register('jobType', { required: true })}>
              {JOB_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Category</span>
            <select {...register('category', { required: true })}>
              {JOB_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Experience Level</span>
            <select {...register('experienceLevel', { required: true })}>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>
        </div>

        <label className="form-field">
          <span>Responsibilities (comma separated)</span>
          <textarea rows="3" placeholder="Responsibility one, Responsibility two" {...register('responsibilities')} />
        </label>

        <label className="form-field">
          <span>Requirements (comma separated)</span>
          <textarea rows="3" placeholder="Skill one, Skill two" {...register('requirements')} />
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/jobs')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create job'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default JobForm

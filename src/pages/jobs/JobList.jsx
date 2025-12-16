import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LuPencilLine, LuPlus, LuTrash2, LuMapPin } from 'react-icons/lu'
import { fetchJobs, deleteJob } from '../../features/jobs/jobSlice'
import { toast } from 'react-toastify'

const JobList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.jobs)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchJobs())
    }
  }, [status, dispatch])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await dispatch(deleteJob(id)).unwrap()
      toast.success('Job deleted')
    } catch (err) {
      toast.error(err || 'Failed to delete job')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Jobs</p>
          <h2>Open Roles</h2>
          <p className="muted">Manage job postings for applicants.</p>
        </div>
        <Link className="primary-button" to="/jobs/new">
          <LuPlus size={16} />
          New Job
        </Link>
      </div>

      {status === 'loading' ? <p className="muted">Loading jobs...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((job) => (
          <article key={job._id} className="card-row blog-card">
            <div className="blog-body">
              <p className="card-title">{job.title}</p>
              <p className="muted">{job.description}</p>
              <p className="muted" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <LuMapPin size={14} /> {job.location}
              </p>
              <p className="muted">
                {job.position} • {job.jobType} • {job.experienceLevel}
              </p>
            </div>
            <div className="card-actions">
              <Link className="ghost-button" to={`/jobs/${job._id}`}>
                <LuPencilLine size={16} />
                Edit
              </Link>
              <button
                className="ghost-button danger"
                disabled={deletingId === job._id}
                onClick={() => handleDelete(job._id)}
              >
                {deletingId === job._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {deletingId === job._id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default JobList

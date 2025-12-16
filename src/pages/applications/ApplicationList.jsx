import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { LuDownload, LuMail, LuPhone, LuUser } from 'react-icons/lu'
import { fetchApplications } from '../../features/applications/applicationSlice'

const ApplicationList = () => {
  const dispatch = useDispatch()
  const { items, status, error } = useSelector((state) => state.applications)

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchApplications())
    }
  }, [status, dispatch])

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Job Applications</p>
          <h2>Applicants</h2>
          <p className="muted">View submissions and download attached resumes.</p>
        </div>
      </div>

      {status === 'loading' ? <p className="muted">Loading applications...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((app) => (
          <article key={app._id} className="card-row blog-card">
            <div className="blog-body">
              <p className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuUser size={16} />
                {app.fullname}
              </p>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuMail size={14} /> {app.email}
              </p>
              <p className="muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LuPhone size={14} /> {app.phone}
              </p>
              {app.job ? (
                <p className="muted" style={{ marginTop: '6px' }}>
                  Job: {app.job.title || app.job._id}
                </p>
              ) : null}
              <p className="muted" style={{ marginTop: '8px' }}>
                {app.whyWeHireYou}
              </p>
              {app.cvUrl ? (
                <a
                  className="muted"
                  href={app.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <LuDownload size={14} />
                  Resume PDF
                </a>
              ) : null}
              {app.createdAt ? (
                <p className="muted" style={{ marginTop: '6px', fontSize: '0.9rem' }}>
                  {new Date(app.createdAt).toLocaleString()}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default ApplicationList

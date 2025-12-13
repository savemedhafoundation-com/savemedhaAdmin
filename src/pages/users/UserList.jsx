import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { LuMail, LuPhone, LuPlus, LuShield, LuTrash2, LuUser , LuUserCog } from 'react-icons/lu'
import { toast } from 'react-toastify'
import { deleteUser, fetchUsers } from '../../features/users/userSlice'

const ADMIN_ROLES = ['admin',  'administrator', 'administartor']

const UserList = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, status, error } = useSelector((state) => state.users)
  const authUser = useSelector((state) => state.auth.user)
  const [actionId, setActionId] = useState(null)

  const isAdmin = useMemo(
    () => (authUser?.role ? ADMIN_ROLES.includes(authUser.role.toLowerCase()) : false),
    [authUser],
  )

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers())
    }
  }, [status, dispatch])

  const canEdit = (userId) => isAdmin || userId === authUser?._id
  const canDelete = (userId) => isAdmin && userId !== authUser?._id

  const handleDelete = async (id) => {
    if (!canDelete(id)) {
      toast.error('You cannot delete this user')
      return
    }
    setActionId(id)
    const result = await dispatch(deleteUser(id))
    if (deleteUser.fulfilled.match(result)) {
      toast.success('User deleted')
    } else {
      toast.error(result.payload || 'Failed to delete user')
    }
    setActionId(null)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Team</p>
          <h2>User Directory</h2>
          <p className="muted">Review admins, update access, and maintain accurate contact details.</p>
        </div>
        {isAdmin ? (
          <Link className="primary-button" to="/users/new">
            <LuPlus size={16} />
            New User
          </Link>
        ) : null}
      </div>

      {status === 'loading' ? <p className="muted">Loading users...</p> : null}
      {status === 'failed' ? <p className="form-error">{error}</p> : null}

      <div className="card-list">
        {items.map((user) => (
          <article key={user._id} className="card-row blog-card">
            <div className="blog-body">
              <div className="blog-head">
                <div className="user-chip">
                  <div className="user-avatar">{user.userImage ? <img src={user.userImage} alt={user.email} /> : user.firstName?.[0] || 'U'}</div>
                  <div>
                    <p className="card-title">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="muted">{user.designation || '-'}</p>
                  </div>
                </div>
                <div className="pill">
                  <LuShield size={14} /> {user.role || 'user'}
                </div>
              </div>

              <div className="blog-meta">
                <span>
                  <LuMail size={14} /> {user.email}
                </span>
                <span>
                  <LuPhone size={14} /> {user.phoneNumber || 'N/A'}
                </span>
                {user.address ? (
                  <span>
                    <LuUser  size={14} /> {user.address}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="card-actions">
              <button
                className="ghost-button ghost-button--solid"
                type="button"
                disabled={!canEdit(user._id)}
                onClick={() => navigate(`/users/${user._id}`)}
                title={!canEdit(user._id) ? 'You can only edit your own profile' : 'Edit user'}
              >
                <LuUserCog size={16} />
                Edit
              </button>
              {/* <button
                className="ghost-button danger ghost-button--solid"
                type="button"
                disabled={!canDelete(user._id) || actionId === user._id}
                onClick={() => handleDelete(user._id)}
                title={
                  !isAdmin
                    ? 'Only admins can delete users'
                    : user._id === authUser?._id
                      ? 'You cannot delete your own account'
                      : 'Delete user'
                }
              >
                {actionId === user._id ? <span className="spinner" /> : <LuTrash2 size={16} />}
                {actionId === user._id ? 'Deleting...' : 'Delete'}
              </button> */}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default UserList

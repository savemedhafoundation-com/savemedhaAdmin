import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { createUser, fetchUsers, updateUser } from '../../features/users/userSlice'
import { updateProfile } from '../../features/auth/authSlice'

const ROLE_OPTIONS = ['admin', 'superadmin', 'administrator']
const ADMIN_ROLES = [...ROLE_OPTIONS, 'administartor']

const UserForm = () => {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { items, status } = useSelector((state) => state.users)
  const authUser = useSelector((state) => state.auth.user)
  const user = items.find((item) => item._id === id)

  const [selectedFile, setSelectedFile] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isAdmin = useMemo(
    () => (authUser?.role ? ADMIN_ROLES.includes(authUser.role.toLowerCase()) : false),
    [authUser],
  )
  const isEditingOwnProfile = id && authUser?._id === id

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      address: '',
      designation: '',
      role: ROLE_OPTIONS[0],
      password: '',
    },
  })

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchUsers())
    }
  }, [status, dispatch])

  useEffect(() => {
    if (!id && !isAdmin) {
      toast.error('Only admins can create users')
      navigate('/users', { replace: true })
    }
  }, [id, isAdmin, navigate])

  useEffect(() => {
    if (!id) return
    if (!isAdmin && !isEditingOwnProfile) {
      toast.error('You can only edit your own profile')
      navigate('/users', { replace: true })
    }
  }, [id, isAdmin, isEditingOwnProfile, navigate])

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        designation: user.designation || '',
        role: user.role || ROLE_OPTIONS[0],
        password: '',
      })
    }
  }, [user, reset])

  const onSubmit = async (values) => {
    setSubmitError('')
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('firstName', values.firstName)
      formData.append('lastName', values.lastName)
      formData.append('email', values.email)
      formData.append('phoneNumber', values.phoneNumber)
      formData.append('address', values.address)
      formData.append('designation', values.designation)
      formData.append('role', values.role)
      if (values.password) {
        formData.append('password', values.password)
      }
      if (selectedFile) {
        formData.append('userImage', selectedFile)
      }

      const result = id
        ? await dispatch(updateUser({ id, data: formData }))
        : await dispatch(createUser(formData))

      if (updateUser.fulfilled.match(result) || createUser.fulfilled.match(result)) {
        toast.success(id ? 'User updated' : 'User created')

        if (isEditingOwnProfile && updateUser.fulfilled.match(result)) {
          dispatch(updateProfile(result.payload))
        }

        navigate('/users')
      } else {
        const message = result.payload || 'Failed to save user'
        setSubmitError(message)
        toast.error(message)
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to save user'
      setSubmitError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (id && status === 'succeeded' && !user) {
    return (
      <div className="page">
        <p className="form-error">User not found</p>
      </div>
    )
  }

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Team</p>
          <h2>{id ? 'Edit User' : 'Create User'}</h2>
          <p className="muted">Manage account access, roles, and contact details.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid two-col">
          <label className="form-field">
            <span>First name</span>
            <input type="text" placeholder="John" {...register('firstName', { required: true })} />
          </label>
          <label className="form-field">
            <span>Last name</span>
            <input type="text" placeholder="Doe" {...register('lastName', { required: true })} />
          </label>
        </div>

        <label className="form-field">
          <span>Email</span>
          <input type="email" placeholder="admin@savemedha.com" {...register('email', { required: true })} />
        </label>

        <label className="form-field">
          <span>Phone number</span>
          <input type="tel" placeholder="+91 9876543210" {...register('phoneNumber', { required: true })} />
        </label>

        <div className="grid two-col">
          <label className="form-field">
            <span>Address</span>
            <input type="text" placeholder="Office location" {...register('address')} />
          </label>
          <label className="form-field">
            <span>Designation</span>
            <input type="text" placeholder="Role in the team" {...register('designation')} />
          </label>
        </div>

        <label className="form-field">
          <span>Role</span>
          <select {...register('role', { required: true })} disabled={!isAdmin}>
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          {!isAdmin ? <p className="form-hint">Only admins can change roles.</p> : null}
        </label>

        <label className="form-field">
          <span>{id ? 'Password (leave blank to keep current)' : 'Password'}</span>
          <input
            type="password"
            placeholder={id ? 'Optional - only if you want to reset' : 'Create a secure password'}
            {...register('password', { required: !id })}
          />
        </label>

        <label className="form-field">
          <span>User image</span>
          <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          {user?.userImage ? <p className="form-hint">Current: {user.userImage}</p> : null}
          {selectedFile ? <p className="form-hint">New file: {selectedFile.name}</p> : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/users')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create user'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserForm

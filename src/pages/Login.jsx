import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { LuLock, LuMail } from 'react-icons/lu'
import { login } from '../features/auth/authSlice'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { status, error, token } = useSelector((state) => state.auth)
  const { register, handleSubmit } = useForm({
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (token) {
      navigate('/')
    }
  }, [token, navigate])

  const onSubmit = async (values) => {
    const result = await dispatch(login(values))
    if (login.fulfilled.match(result)) {
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to manage Savemedha content and services.</p>
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="form-field">
            <span>Email</span>
            <div className="form-input">
              <LuMail size={16} />
              <input type="email" placeholder="admin@savemedha.io" {...register('email', { required: true })} />
            </div>
          </label>

          <label className="form-field">
            <span>Password</span>
            <div className="form-input">
              <LuLock size={16} />
              <input type="password" placeholder="********" {...register('password', { required: true })} />
            </div>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

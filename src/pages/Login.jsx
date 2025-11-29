import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import { LuLock, LuMail } from 'react-icons/lu'
import api from '../api/axios'
import { loginSuccess, setAuthError, setAuthStatus } from '../features/auth/authSlice'

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
    dispatch(setAuthStatus('loading'))
    dispatch(setAuthError(null))
    try {
      // Swap this stub with a real API call when backend is ready.
      await api.post('/users/login', values)
      dispatch(
        loginSuccess({
          token: 'demo-jwt-token',
          user: { name: 'Admin User', email: values.email },
        }),
      )
      dispatch(setAuthStatus('succeeded'))
      const redirectTo = location.state?.from?.pathname || '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      dispatch(setAuthStatus('failed'))
      dispatch(setAuthError(err?.response?.data?.message || 'Login failed'))
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
              <input type="password" placeholder="••••••••" {...register('password', { required: true })} />
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

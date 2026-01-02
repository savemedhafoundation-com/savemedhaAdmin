import axios from 'axios'
import { setLoading } from '../features/ui/uiSlice'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://savemedhabackend.vercel.app/api',
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
})

let storeRef
let pendingRequests = 0

export const injectStore = (store) => {
  storeRef = store
}

api.interceptors.request.use(
  (config) => {
    const token = storeRef?.getState().auth.token || localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (pendingRequests === 0) {
      storeRef?.dispatch(setLoading(true))
    }
    pendingRequests += 1
    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    if (status === 401 || status === 403) {
      storeRef?.dispatch({ type: 'auth/logout' })
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

api.interceptors.response.use(
  (response) => {
    pendingRequests = Math.max(0, pendingRequests - 1)
    if (pendingRequests === 0) {
      storeRef?.dispatch(setLoading(false))
    }
    return response
  },
  (error) => {
    pendingRequests = Math.max(0, pendingRequests - 1)
    if (pendingRequests === 0) {
      storeRef?.dispatch(setLoading(false))
    }
    return Promise.reject(error)
  },
)

export default api

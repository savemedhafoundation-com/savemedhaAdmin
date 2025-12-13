import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://savemedhabackend.vercel.app/api',
  timeout: 15000,
})

let storeRef

export const injectStore = (store) => {
  storeRef = store
}

api.interceptors.request.use(
  (config) => {
    const token = storeRef?.getState().auth.token || localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
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

export default api

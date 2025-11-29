import { createSlice } from '@reduxjs/toolkit'

const storedToken = localStorage.getItem('authToken')

const initialState = {
  token: storedToken || null,
  user: storedToken ? { name: 'Admin User', email: 'admin@savemedha.io' } : null,
  status: 'idle',
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('authToken', state.token)
    },
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('authToken')
    },
    setAuthStatus: (state, action) => {
      state.status = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const { loginSuccess, logout, setAuthStatus, setAuthError } = authSlice.actions

export default authSlice.reducer

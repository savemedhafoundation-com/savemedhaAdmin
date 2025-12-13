import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const storedToken = localStorage.getItem('authToken')
const storedUser = localStorage.getItem('authUser')

const initialState = {
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  status: 'idle',
  error: null,
}

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/users/login', credentials)
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Login failed')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('authToken', state.token)
      localStorage.setItem('authUser', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.token = null
      state.user = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('authUser')
    },
    setAuthStatus: (state, action) => {
      state.status = action.payload
    },
    setAuthError: (state, action) => {
      state.error = action.payload
    },
    updateProfile: (state, action) => {
      state.user = { ...(state.user || {}), ...action.payload }
      localStorage.setItem('authUser', JSON.stringify(state.user))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.error = null
        state.token = action.payload.token
        state.user = action.payload.user
        localStorage.setItem('authToken', state.token)
        localStorage.setItem('authUser', JSON.stringify(state.user))
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Login failed'
      })
  },
})

export const { loginSuccess, logout, setAuthStatus, setAuthError, updateProfile } = authSlice.actions

export default authSlice.reducer

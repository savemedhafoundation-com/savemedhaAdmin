import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchApplications = createAsyncThunk(
  'applications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/applications')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load applications')
    }
  }
)

export const fetchApplicationById = createAsyncThunk(
  'applications/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/applications/${id}`)
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load application')
    }
  }
)

const applicationSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load applications'
      })
      .addCase(fetchApplicationById.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a._id === action.payload._id)
        if (idx !== -1) {
          state.items[idx] = action.payload
        } else {
          state.items.unshift(action.payload)
        }
      })
  },
})

export default applicationSlice.reducer

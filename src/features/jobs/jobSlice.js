import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchJobs = createAsyncThunk('jobs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/jobs')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load jobs')
  }
})

export const createJob = createAsyncThunk('jobs/create', async (data, { rejectWithValue }) => {
  try {
    const response = await api.post('/jobs', data)
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to create job')
  }
})

export const updateJob = createAsyncThunk('jobs/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/jobs/${id}`, data)
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to update job')
  }
})

export const deleteJob = createAsyncThunk('jobs/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/jobs/${id}`)
    return id
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to delete job')
  }
})

const jobSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load jobs'
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const idx = state.items.findIndex((j) => j._id === action.payload._id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.items = state.items.filter((j) => j._id !== action.payload)
      })
  },
})

export default jobSlice.reducer

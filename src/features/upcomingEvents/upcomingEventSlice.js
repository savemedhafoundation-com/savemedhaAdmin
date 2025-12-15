import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchUpcomingEvents = createAsyncThunk(
  'upcomingEvents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/upcoming-events')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load upcoming events')
    }
  }
)

const upcomingEventSlice = createSlice({
  name: 'upcomingEvents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUpcomingEvents.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load upcoming events'
      })
  },
})

export default upcomingEventSlice.reducer

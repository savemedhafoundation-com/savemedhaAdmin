import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchOngoingEvents = createAsyncThunk(
  'ongoingEvents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/ongoing-events')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load ongoing events')
    }
  }
)

const ongoingEventSlice = createSlice({
  name: 'ongoingEvents',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOngoingEvents.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchOngoingEvents.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchOngoingEvents.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load ongoing events'
      })
  },
})

export default ongoingEventSlice.reducer

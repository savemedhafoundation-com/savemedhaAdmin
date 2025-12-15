import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchTreatments = createAsyncThunk(
  'treatments/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/treatments')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load treatments')
    }
  }
)

const treatmentSlice = createSlice({
  name: 'treatments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreatments.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load treatments'
      })
  },
})

export default treatmentSlice.reducer

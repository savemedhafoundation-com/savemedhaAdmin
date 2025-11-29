import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchServices = createAsyncThunk('services/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/services')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load services')
  }
})

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load services'
      })
  },
})

export default serviceSlice.reducer

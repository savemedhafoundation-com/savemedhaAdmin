import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchPatientSuccess = createAsyncThunk(
  'patientSuccess/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/patient-success-stories')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load patient success stories')
    }
  }
)

const patientSuccessSlice = createSlice({
  name: 'patientSuccess',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientSuccess.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPatientSuccess.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPatientSuccess.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load patient success stories'
      })
  },
})

export default patientSuccessSlice.reducer

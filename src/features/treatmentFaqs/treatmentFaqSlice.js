import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchTreatmentFaqs = createAsyncThunk(
  'treatmentFaqs/fetchAll',
  async ({ title, q } = {}, { rejectWithValue }) => {
    try {
      const params = {}
      if (title) params.title = title
      if (q) params.q = q
      const response = await api.get('/treatment-faqs', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load treatment FAQs')
    }
  }
)

const treatmentFaqSlice = createSlice({
  name: 'treatmentFaqs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTreatmentFaqs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTreatmentFaqs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchTreatmentFaqs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load treatment FAQs'
      })
  },
})

export default treatmentFaqSlice.reducer

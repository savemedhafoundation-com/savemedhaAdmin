import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchTestimonials = createAsyncThunk('testimonials/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/testimonials')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load testimonials')
  }
})

export const createTestimonial = createAsyncThunk(
  'testimonials/create',
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/testimonials', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      dispatch(fetchTestimonials())
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create testimonial')
    }
  },
)

export const updateTestimonial = createAsyncThunk(
  'testimonials/update',
  async ({ id, formData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/testimonials/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      dispatch(fetchTestimonials())
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update testimonial')
    }
  },
)

export const deleteTestimonial = createAsyncThunk(
  'testimonials/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/testimonials/${id}`)
      dispatch(fetchTestimonials())
      return id
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete testimonial')
    }
  },
)

const testimonialSlice = createSlice({
  name: 'testimonials',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestimonials.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchTestimonials.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchTestimonials.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(deleteTestimonial.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteTestimonial.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(deleteTestimonial.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export default testimonialSlice.reducer

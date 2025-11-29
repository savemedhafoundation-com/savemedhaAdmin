import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchNewsletters = createAsyncThunk('newsletter/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/newsletter')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load subscribers')
  }
})

export const createNewsletter = createAsyncThunk(
  'newsletter/create',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/newsletter', payload)
      dispatch(fetchNewsletters())
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create')
    }
  },
)

export const updateNewsletter = createAsyncThunk(
  'newsletter/update',
  async ({ id, email }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/newsletter/${id}`, { email })
      dispatch(fetchNewsletters())
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update')
    }
  },
)

export const deleteNewsletter = createAsyncThunk(
  'newsletter/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/newsletter/${id}`)
      dispatch(fetchNewsletters())
      return id
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete')
    }
  },
)

const newsletterSlice = createSlice({
  name: 'newsletter',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNewsletters.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchNewsletters.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchNewsletters.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load subscribers'
      })
      .addCase(deleteNewsletter.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteNewsletter.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(deleteNewsletter.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export default newsletterSlice.reducer

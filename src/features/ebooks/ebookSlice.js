import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchEbooks = createAsyncThunk('ebooks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/ebooks')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load ebooks')
  }
})

export const createEbook = createAsyncThunk('ebooks/create', async (formData, { rejectWithValue }) => {
  try {
    const response = await api.post('/ebooks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to create ebook')
  }
})

export const updateEbook = createAsyncThunk(
  'ebooks/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/ebooks/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update ebook')
    }
  }
)

export const deleteEbook = createAsyncThunk('ebooks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/ebooks/${id}`)
    return id
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to delete ebook')
  }
})

const ebookSlice = createSlice({
  name: 'ebooks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEbooks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchEbooks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchEbooks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load ebooks'
      })
      .addCase(createEbook.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateEbook.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b._id === action.payload._id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteEbook.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload)
      })
  },
})

export default ebookSlice.reducer

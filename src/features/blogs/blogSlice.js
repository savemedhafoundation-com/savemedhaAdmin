import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchBlogs = createAsyncThunk('blogs/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/blogs');
    console.log("blog response",response);
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load blogs')
  }
})

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load blogs'
      })
  },
})

export default blogSlice.reducer

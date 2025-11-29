import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

export const VALID_STATUSES = ['pending', 'not received', 'done']

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchCallbacks = createAsyncThunk('callbacks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/callbacks')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load callbacks')
  }
})

export const createCallback = createAsyncThunk(
  'callbacks/create',
  async (payload, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/callbacks', payload)
      dispatch(fetchCallbacks())
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create callback')
    }
  },
)

export const updateCallback = createAsyncThunk(
  'callbacks/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/callbacks/${id}`, data)
      dispatch(fetchCallbacks())
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update callback')
    }
  },
)

export const deleteCallback = createAsyncThunk(
  'callbacks/delete',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await api.delete(`/callbacks/${id}`)
      dispatch(fetchCallbacks())
      return id
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete callback')
    }
  },
)

const callbackSlice = createSlice({
  name: 'callbacks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCallbacks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCallbacks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCallbacks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(deleteCallback.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(deleteCallback.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(deleteCallback.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export default callbackSlice.reducer

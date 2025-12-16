import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/addresses')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load addresses')
    }
  }
)

export const createAddress = createAsyncThunk(
  'addresses/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post('/addresses', data)
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to create address')
    }
  }
)

export const updateAddress = createAsyncThunk(
  'addresses/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/addresses/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update address')
    }
  }
)

export const deleteAddress = createAsyncThunk(
  'addresses/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/addresses/${id}`)
      return id
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to delete address')
    }
  }
)

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load addresses'
      })
      .addCase(createAddress.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        const idx = state.items.findIndex((a) => a._id === action.payload._id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.items = state.items.filter((a) => a._id !== action.payload)
      })
  },
})

export default addressSlice.reducer

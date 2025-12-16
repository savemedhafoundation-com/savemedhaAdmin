import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchContacts = createAsyncThunk(
  'contacts/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/contact-us')
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to load contacts')
    }
  }
)

export const updateContact = createAsyncThunk(
  'contacts/update',
  async ({ id, data }, { rejectWithValue }) => {
    // console.log("data", data)
    try {
      const response = await api.put(`/contact-us/${id}`, data)
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update contact')
    }
  }
)

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load contacts'
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        const idx = state.items.findIndex((c) => c._id === action.payload._id)
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...action.payload }
        }
      })
  },
})

export default contactsSlice.reducer

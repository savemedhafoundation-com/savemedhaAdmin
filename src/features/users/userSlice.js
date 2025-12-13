import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  mutationStatus: 'idle',
  mutationError: null,
}

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/users')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load users')
  }
})

export const createUser = createAsyncThunk('users/create', async (formData, { rejectWithValue, dispatch }) => {
  try {
    const response = await api.post('/users/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    dispatch(fetchUsers())
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to create user')
  }
})

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ id, data }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.put(`/users/${id}`, data, {
        headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
      })
      dispatch(fetchUsers())
      return response.data
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || 'Failed to update user')
    }
  },
)

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue, dispatch }) => {
  try {
    await api.delete(`/users/${id}`)
    dispatch(fetchUsers())
    return id
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to delete user')
  }
})

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(createUser.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = null
      })
      .addCase(createUser.fulfilled, (state) => {
        state.mutationStatus = 'succeeded'
      })
      .addCase(createUser.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload
      })
      .addCase(updateUser.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = null
      })
      .addCase(updateUser.fulfilled, (state) => {
        state.mutationStatus = 'succeeded'
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload
      })
      .addCase(deleteUser.pending, (state) => {
        state.mutationStatus = 'loading'
        state.mutationError = null
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.mutationStatus = 'succeeded'
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.mutationStatus = 'failed'
        state.mutationError = action.payload
      })
  },
})

export default userSlice.reducer

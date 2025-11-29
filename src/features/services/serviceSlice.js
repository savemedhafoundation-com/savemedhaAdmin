import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  items: [
    {
      id: 'starter',
      name: 'Starter Consultation',
      price: 199,
      status: 'Active',
      updatedAt: new Date().toISOString(),
    },
  ],
  status: 'idle',
  error: null,
}

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action) => {
      state.items = action.payload
    },
    addService: {
      reducer: (state, action) => {
        state.items.unshift(action.payload)
      },
      prepare: (data) => ({
        payload: {
          id: nanoid(),
          updatedAt: new Date().toISOString(),
          status: data.status || 'Draft',
          ...data,
        },
      }),
    },
    updateService: (state, action) => {
      const { id, data } = action.payload
      const index = state.items.findIndex((item) => item.id === id)
      if (index !== -1) {
        state.items[index] = {
          ...state.items[index],
          ...data,
          updatedAt: new Date().toISOString(),
        }
      }
    },
    deleteService: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
})

export const { setServices, addService, updateService, deleteService } = serviceSlice.actions

export default serviceSlice.reducer

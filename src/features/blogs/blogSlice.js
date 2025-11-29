import { createSlice, nanoid } from '@reduxjs/toolkit'

const initialState = {
  items: [
    {
      id: 'welcome',
      title: 'Welcome to Savemedha',
      summary: 'Kick-off post that introduces the platform mission and goals.',
      status: 'Published',
      updatedAt: new Date().toISOString(),
    },
  ],
  status: 'idle',
  error: null,
}

const blogSlice = createSlice({
  name: 'blogs',
  initialState,
  reducers: {
    setBlogs: (state, action) => {
      state.items = action.payload
    },
    addBlog: {
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
    updateBlog: (state, action) => {
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
    deleteBlog: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
  },
})

export const { setBlogs, addBlog, updateBlog, deleteBlog } = blogSlice.actions

export default blogSlice.reducer

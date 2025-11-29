import { createSlice } from '@reduxjs/toolkit'

const storedTheme = localStorage.getItem('savemedha-theme')

const initialState = {
  theme: storedTheme || 'light',
  loading: false,
  notification: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('savemedha-theme', state.theme)
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem('savemedha-theme', state.theme)
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setNotification: (state, action) => {
      state.notification = action.payload
    },
  },
})

export const { toggleTheme, setTheme, setLoading, setNotification } = uiSlice.actions

export default uiSlice.reducer

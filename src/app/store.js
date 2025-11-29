import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import blogReducer from '../features/blogs/blogSlice'
import serviceReducer from '../features/services/serviceSlice'
import uiReducer from '../features/ui/uiSlice'
import { injectStore } from '../api/axios'

const store = configureStore({
  reducer: {
    auth: authReducer,
    blogs: blogReducer,
    services: serviceReducer,
    ui: uiReducer,
  },
})

injectStore(store)

export default store

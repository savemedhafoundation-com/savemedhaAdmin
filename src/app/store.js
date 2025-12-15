import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import blogReducer from '../features/blogs/blogSlice'
import serviceReducer from '../features/services/serviceSlice'
import testimonialReducer from '../features/testimonials/testimonialSlice'
import treatmentReducer from '../features/treatments/treatmentSlice'
import treatmentFaqReducer from '../features/treatmentFaqs/treatmentFaqSlice'
import upcomingEventReducer from '../features/upcomingEvents/upcomingEventSlice'
import ongoingEventReducer from '../features/ongoingEvents/ongoingEventSlice'
import patientSuccessReducer from '../features/patientSuccess/patientSuccessSlice'
import userReducer from '../features/users/userSlice'
import uiReducer from '../features/ui/uiSlice'
import newsletterReducer from '../features/newsletter/newsletterSlice'
import callbackReducer from '../features/callbacks/callbackSlice'
import { injectStore } from '../api/axios'

const store = configureStore({
  reducer: {
    auth: authReducer,
    blogs: blogReducer,
    services: serviceReducer,
    testimonials: testimonialReducer,
    treatments: treatmentReducer,
    treatmentFaqs: treatmentFaqReducer,
    upcomingEvents: upcomingEventReducer,
    ongoingEvents: ongoingEventReducer,
    patientSuccess: patientSuccessReducer,
    users: userReducer,
    ui: uiReducer,
    newsletter: newsletterReducer,
    callbacks: callbackReducer,
  },
})

injectStore(store)

export default store

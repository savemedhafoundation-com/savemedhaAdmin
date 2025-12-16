import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/common/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import BlogList from './pages/blogs/BlogList'
import BlogForm from './pages/blogs/BlogForm'
import ServiceList from './pages/services/ServiceList'
import ServiceForm from './pages/services/ServiceForm'
import TreatmentList from './pages/treatments/TreatmentList'
import TreatmentForm from './pages/treatments/TreatmentForm'
import TreatmentFaqList from './pages/treatmentFaqs/TreatmentFaqList'
import TreatmentFaqForm from './pages/treatmentFaqs/TreatmentFaqForm'
import UpcomingEventList from './pages/upcomingEvents/UpcomingEventList'
import UpcomingEventForm from './pages/upcomingEvents/UpcomingEventForm'
import OngoingEventList from './pages/ongoingEvents/OngoingEventList'
import OngoingEventForm from './pages/ongoingEvents/OngoingEventForm'
import PatientSuccessList from './pages/patientSuccess/PatientSuccessList'
import PatientSuccessForm from './pages/patientSuccess/PatientSuccessForm'
import ContactList from './pages/contacts/ContactList'
import AddressList from './pages/addresses/AddressList'
import AddressForm from './pages/addresses/AddressForm'
import TestimonialList from './pages/testimonials/TestimonialList'
import TestimonialForm from './pages/testimonials/TestimonialForm'
import Login from './pages/Login'
import NewsletterList from './pages/newsletter/NewsletterList'
import CallbackList from './pages/callbacks/CallbackList'
import CallbackForm from './pages/callbacks/CallbackForm'
import UserList from './pages/users/UserList'
import UserForm from './pages/users/UserForm'
import GlobalLoader from './components/common/GlobalLoader'

const ThemeWatcher = () => {
  const theme = useSelector((state) => state.ui.theme)

  useEffect(() => {
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
  }, [theme])

  return null
}

function App() {
  return (
    <>
      <ThemeWatcher />
      <GlobalLoader />
      <ToastContainer position="top-right" autoClose={3000} pauseOnHover={false} />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/new" element={<BlogForm />} />
          <Route path="/blogs/:id" element={<BlogForm />} />
          <Route path="/services" element={<ServiceList />} />
          <Route path="/services/new" element={<ServiceForm />} />
          <Route path="/services/:id" element={<ServiceForm />} />
          <Route path="/treatments" element={<TreatmentList />} />
          <Route path="/treatments/new" element={<TreatmentForm />} />
          <Route path="/treatments/:id" element={<TreatmentForm />} />
          <Route path="/treatment-faqs" element={<TreatmentFaqList />} />
          <Route path="/treatment-faqs/new" element={<TreatmentFaqForm />} />
          <Route path="/treatment-faqs/:id" element={<TreatmentFaqForm />} />
          <Route path="/upcoming-events" element={<UpcomingEventList />} />
          <Route path="/upcoming-events/new" element={<UpcomingEventForm />} />
          <Route path="/upcoming-events/:id" element={<UpcomingEventForm />} />
          <Route path="/ongoing-events" element={<OngoingEventList />} />
          <Route path="/ongoing-events/new" element={<OngoingEventForm />} />
          <Route path="/ongoing-events/:id" element={<OngoingEventForm />} />
          <Route path="/patient-success-stories" element={<PatientSuccessList />} />
          <Route path="/patient-success-stories/new" element={<PatientSuccessForm />} />
          <Route path="/patient-success-stories/:id" element={<PatientSuccessForm />} />
          <Route path="/contacts" element={<ContactList />} />
          <Route path="/addresses" element={<AddressList />} />
          <Route path="/addresses/new" element={<AddressForm />} />
          <Route path="/addresses/:id" element={<AddressForm />} />
          <Route path="/testimonials" element={<TestimonialList />} />
          <Route path="/testimonials/new" element={<TestimonialForm />} />
          <Route path="/testimonials/:id" element={<TestimonialForm />} />
          <Route path="/requestcallbacks" element={<CallbackList />} />
          <Route path="/requestcallbacks/new" element={<CallbackForm />} />
          <Route path="/newsletter" element={<NewsletterList />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/new" element={<UserForm />} />
          <Route path="/users/:id" element={<UserForm />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

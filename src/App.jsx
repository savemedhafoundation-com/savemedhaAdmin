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
import TestimonialList from './pages/testimonials/TestimonialList'
import TestimonialForm from './pages/testimonials/TestimonialForm'
import Login from './pages/Login'
import NewsletterList from './pages/newsletter/NewsletterList'
import CallbackList from './pages/callbacks/CallbackList'
import CallbackForm from './pages/callbacks/CallbackForm'

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
          <Route path="/testimonials" element={<TestimonialList />} />
          <Route path="/testimonials/new" element={<TestimonialForm />} />
          <Route path="/testimonials/:id" element={<TestimonialForm />} />
          <Route path="/requestcallbacks" element={<CallbackList />} />
          <Route path="/requestcallbacks/new" element={<CallbackForm />} />
          <Route path="/newsletter" element={<NewsletterList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App

import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'

// Home is eagerly loaded for the fastest first paint; other routes are split.
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Application = lazy(() => import('./pages/Application'))
const Contact = lazy(() => import('./pages/Contact'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const Terms = lazy(() => import('./pages/Terms'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about-acadia-care" element={<About />} />
        <Route path="services" element={<Services />} />
        <Route path="application" element={<Application />} />
        <Route path="contact-acadia-care" element={<Contact />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
        <Route path="terms-and-conditions" element={<Terms />} />
        {/* Friendly aliases */}
        <Route path="about" element={<Navigate to="/about-acadia-care" replace />} />
        <Route path="contact" element={<Navigate to="/contact-acadia-care" replace />} />
        <Route path="careers" element={<Navigate to="/application" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

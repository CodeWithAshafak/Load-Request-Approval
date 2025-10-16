import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Componets/Header'
import Footer from './Componets/Footer'

export default function Layout() {
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  return (
    <>
      {/* Show Header/Footer only for non-dashboard pages */}
      {!isDashboard && <Header />}
      <Outlet />
      {!isDashboard && <Footer />}
    </>
  )
}

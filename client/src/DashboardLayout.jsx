import React from 'react'
import { Outlet } from 'react-router-dom'


export default function DashboardLayout() {
  return (
    <div className="flex">
      {/* Optional Sidebar */}
      
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}

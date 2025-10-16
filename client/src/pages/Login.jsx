import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../store/slices/authSlice'
import { Menu, X, FileText, Users, Search } from 'lucide-react'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const result = await dispatch(login(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        const userRole = result.payload.role
        navigate(userRole === 'LSR' ? '/lsr' : '/logistics')
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleDemoLogin = async (role) => {
    const credentials = role === 'LSR' 
      ? { email: 'lsr@demo.com', password: 'password123' }
      : { email: 'logistics@demo.com', password: 'password123' }
    
    try {
      const result = await dispatch(login(credentials))
      if (result.meta.requestStatus === 'fulfilled') {
        navigate(role === 'LSR' ? '/lsr' : '/logistics')
      }
    } catch (error) {
      console.error('Demo login failed:', error)
    }
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <div className={`bg-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col h-screen overflow-hidden ${
        sidebarOpen ? 'w-64' : 'w-0'
      }`}>
        {/* Sidebar header with close button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
            title="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Navigation - Login specific */}
        <nav className="flex-1 mt-8 px-4 overflow-y-auto">
          <div className="space-y-2 pb-4">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              MODULES
            </div>
            <div className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg text-gray-400 cursor-not-allowed">
              <FileText className="mr-4 h-5 w-5 flex-shrink-0" />
              Load Management
            </div>
            <div className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg text-gray-400 cursor-not-allowed">
              <Users className="mr-4 h-5 w-5 flex-shrink-0" />
              Products & Sales
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            Please login to access the system
          </p>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Top Header */}
        <div className="flex-shrink-0 z-30 bg-white backdrop-blur-md shadow-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                title="Toggle Sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4 flex items-center bg-gray-50 rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="ml-2 bg-transparent border-none outline-none text-sm text-gray-600 placeholder-gray-400"
                  disabled
                />
                <span className="ml-2 text-xs text-gray-400">⌘K</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">Guest</p>
                <p className="text-xs text-gray-500">Not logged in</p>
              </div>
              <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">G</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            {/* Page Title */}
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Manual Login Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center mb-3">
                  <strong>Demo Credentials:</strong>
                </p>
                <div className="space-y-2">
                  <button
                    onClick={() => handleDemoLogin('LSR')}
                    disabled={loading}
                    className="w-full py-2 px-4 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200"
                  >
                    <FileText className="inline h-4 w-4 mr-2" />
                    Demo Login as LSR
                  </button>
                  <button
                    onClick={() => handleDemoLogin('LOGISTICS')}
                    disabled={loading}
                    className="w-full py-2 px-4 text-sm font-medium text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-green-200"
                  >
                    <Users className="inline h-4 w-4 mr-2" />
                    Demo Login as Logistics
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
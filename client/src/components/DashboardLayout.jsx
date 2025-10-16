// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useDispatch, useSelector } from 'react-redux'
// import { logout } from '../store/slices/authSlice'
// import { 
//   Menu, 
//   X, 
//   Home, 
//   FileText, 
//   History, 
//   CheckCircle, 
//   LogOut, 
//   User,
//   Bell,
//   Settings
// } from 'lucide-react'

// const DashboardLayout = ({ children, userRole, title, subtitle }) => {
//   const navigate = useNavigate()
//   const dispatch = useDispatch()
//   const { user } = useSelector((state) => state.auth)
  
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [notificationsOpen, setNotificationsOpen] = useState(false)

//   const handleLogout = () => {
//     dispatch(logout())
//     navigate('/login')
//   }

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen)
//   }

//   const toggleNotifications = () => {
//     setNotificationsOpen(!notificationsOpen)
//   }

//   // Navigation items based on role
//   const getNavItems = () => {
//     if (userRole === 'LSR') {
//       return [
//         { name: 'Dashboard', icon: Home, path: '/lsr' },
//         { name: 'New Request', icon: FileText, path: '/lsr/new' },
//         { name: 'History', icon: History, path: '/lsr/history' }
//       ]
//     } else if (userRole === 'LOGISTICS') {
//       return [
//         { name: 'Pending Requests', icon: FileText, path: '/logistics' },
//         { name: 'Approved Requests', icon: CheckCircle, path: '/logistics/approved' }
//       ]
//     }
//     return []
//   }

//   const navItems = getNavItems()

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
//       {/* Mobile sidebar overlay */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
//         sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//       }`}>
//         {/* Sidebar header */}
//         <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
//                 <span className="text-white font-bold text-lg">LSR</span>
//               </div>
//             </div>
//             <div className="ml-4">
//               <h1 className="text-xl font-bold text-white">
//                 {userRole === 'LSR' ? 'LSR Portal' : 'Logistics Portal'}
//               </h1>
//               <p className="text-blue-100 text-sm">Load Service Management</p>
//             </div>
//           </div>
//           <button
//             onClick={toggleSidebar}
//             className="lg:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
//           >
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         {/* User info */}
//         <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
//                 <User className="h-6 w-6 text-white" />
//               </div>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-semibold text-gray-900">{user?.userName}</p>
//               <p className="text-xs text-gray-600">{user?.email}</p>
//               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
//                 {user?.role}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="mt-8 px-4">
//           <div className="space-y-2">
//             {navItems.map((item) => (
//               <button
//                 key={item.name}
//                 onClick={() => {
//                   navigate(item.path)
//                   setSidebarOpen(false)
//                 }}
//                 className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl w-full text-left transition-all duration-200 ${
//                   window.location.pathname === item.path
//                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
//                     : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
//                 }`}
//               >
//                 <item.icon className={`mr-4 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
//                   window.location.pathname === item.path ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
//                 }`} />
//                 {item.name}
//               </button>
//             ))}
//           </div>
//         </nav>

//         {/* Sidebar footer */}
//         <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50">
//           <button
//             onClick={handleLogout}
//             className="group flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 w-full text-left transition-all duration-200"
//           >
//             <LogOut className="mr-4 h-5 w-5 flex-shrink-0 group-hover:text-red-600 transition-colors duration-200" />
//             Sign out
//           </button>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:pl-72">
//         {/* Top navigation */}
//         <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200">
//           <div className="flex items-center justify-between h-20 px-6 lg:px-8">
//             <div className="flex items-center">
//               <button
//                 onClick={toggleSidebar}
//                 className="lg:hidden p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
//               >
//                 <Menu className="h-6 w-6" />
//               </button>
//               <div className="ml-4 lg:ml-0">
//                 <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
//                 {subtitle && (
//                   <p className="text-gray-600 font-medium">{subtitle}</p>
//                 )}
//               </div>
//             </div>

//             <div className="flex items-center space-x-6">
//               {/* Notifications */}
//               <div className="relative">
//                 <button
//                   onClick={toggleNotifications}
//                   className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
//                 >
//                   <Bell className="h-6 w-6" />
//                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
//                 </button>
//                 {notificationsOpen && (
//                   <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
//                     <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
//                       <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
//                     </div>
//                     <div className="p-6 text-gray-500 text-center">
//                       <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//                       <p className="font-medium">No notifications</p>
//                       <p className="text-sm">You're all caught up!</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* User menu */}
//               <div className="flex items-center space-x-4">
//                 <div className="hidden sm:block text-right">
//                   <p className="text-sm font-semibold text-gray-900">{user?.userName}</p>
//                   <p className="text-xs text-gray-600 font-medium">{user?.role}</p>
//                 </div>
//                 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
//                   <User className="h-5 w-5 text-white" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Page content */}
//         <main className="p-6 lg:p-10">
//           <div className="max-w-7xl mx-auto">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }

// export default DashboardLayout



// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useDispatch, useSelector } from 'react-redux'
// import { logout } from '../store/slices/authSlice'
// import { 
//   Menu, 
//   X, 
//   Home, 
//   FileText, 
//   History, 
//   CheckCircle, 
//   LogOut, 
//   User,
//   Bell,
//   Settings
// } from 'lucide-react'

// const DashboardLayout = ({ children, userRole, title, subtitle }) => {
//   const navigate = useNavigate()
//   const dispatch = useDispatch()
//   const { user } = useSelector((state) => state.auth)
  
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const [notificationsOpen, setNotificationsOpen] = useState(false)

//   const handleLogout = () => {
//     dispatch(logout())
//     navigate('/login')
//   }

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen)
//   }

//   const toggleNotifications = () => {
//     setNotificationsOpen(!notificationsOpen)
//   }

//   // Navigation items based on role
//   const getNavItems = () => {
//     if (userRole === 'LSR') {
//       return [
//         { name: 'Dashboard', icon: Home, path: '/lsr' },
//         { name: 'New Request', icon: FileText, path: '/lsr/new' },
//         { name: 'History', icon: History, path: '/lsr/history' }
//       ]
//     } else if (userRole === 'LOGISTICS') {
//       return [
//         { name: 'Pending Requests', icon: FileText, path: '/logistics' },
//         { name: 'Approved Requests', icon: CheckCircle, path: '/logistics/approved' }
//       ]
//     }
//     return []
//   }

//   const navItems = getNavItems()

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">

//       {/* Sidebar */}
//       {sidebarOpen && (
//         <div 
//           className="fixed inset-0 z-40 bg-gray-900 bg-opacity-50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//       <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
//         sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//       }`}>
//         {/* Sidebar header */}
//         <div className="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-700">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
//                 <span className="text-white font-bold text-lg">LSR</span>
//               </div>
//             </div>
//             <div className="ml-4">
//               <h1 className="text-xl font-bold text-white">
//                 {userRole === 'LSR' ? 'LSR Portal' : 'Logistics Portal'}
//               </h1>
//               <p className="text-blue-100 text-sm">Load Service Management</p>
//             </div>
//           </div>
//           <button
//             onClick={toggleSidebar}
//             className="lg:hidden p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200"
//           >
//             <X className="h-6 w-6" />
//           </button>
//         </div>

//         {/* User info */}
//         <div className="px-6 py-6 border-b border-gray-200 bg-gray-50">
//           <div className="flex items-center">
//             <div className="flex-shrink-0">
//               <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
//                 <User className="h-6 w-6 text-white" />
//               </div>
//             </div>
//             <div className="ml-4">
//               <p className="text-sm font-semibold text-gray-900">{user?.userName}</p>
//               <p className="text-xs text-gray-600">{user?.email}</p>
//               <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
//                 {user?.role}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Navigation */}
//         <nav className="mt-8 px-4">
//           <div className="space-y-2">
//             {navItems.map((item) => (
//               <button
//                 key={item.name}
//                 onClick={() => {
//                   navigate(item.path)
//                   setSidebarOpen(false)
//                 }}
//                 className={`group flex items-center px-4 py-3 text-sm font-semibold rounded-xl w-full text-left transition-all duration-200 ${
//                   window.location.pathname === item.path
//                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
//                     : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md'
//                 }`}
//               >
//                 <item.icon className={`mr-4 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
//                   window.location.pathname === item.path ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'
//                 }`} />
//                 {item.name}
//               </button>
//             ))}
//           </div>
//         </nav>

//         {/* Sidebar footer */}
//         <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gray-50">
//           <button
//             onClick={handleLogout}
//             className="group flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 w-full text-left transition-all duration-200"
//           >
//             <LogOut className="mr-4 h-5 w-5 flex-shrink-0 group-hover:text-red-600 transition-colors duration-200" />
//             Sign out
//           </button>
//         </div>
//       </div>

//       {/* Main content wrapper */}
//       <div className="flex-1 flex flex-col lg:pl-64 max-w-screen-lg mx-auto w-full">
//         {/* Top navigation */}
//         <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-20">
//             <button
//               onClick={toggleSidebar}
//               className="lg:hidden p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
//             >
//               <Menu className="h-6 w-6" />
//             </button>
//             <div className="ml-4 lg:ml-0">
//               <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
//               {subtitle && <p className="text-gray-600 font-medium">{subtitle}</p>}
//             </div>
//             <div className="flex items-center space-x-6">
//               {/* Notifications */}
//               <div className="relative">
//                 <button
//                   onClick={toggleNotifications}
//                   className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
//                 >
//                   <Bell className="h-6 w-6" />
//                   <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
//                 </button>
//                 {notificationsOpen && (
//                   <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto">
//                     <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
//                       <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
//                     </div>
//                     <div className="p-6 text-gray-500 text-center">
//                       <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
//                       <p className="font-medium">No notifications</p>
//                       <p className="text-sm">You're all caught up!</p>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* User menu */}
//               <div className="flex items-center space-x-4">
//                 <div className="hidden sm:block text-right">
//                   <p className="text-sm font-semibold text-gray-900">{user?.userName}</p>
//                   <p className="text-xs text-gray-600 font-medium">{user?.role}</p>
//                 </div>
//                 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
//                   <User className="h-5 w-5 text-white" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Page content */}
//         <main className="flex-grow p-6 lg:p-10 overflow-auto">
//           <div className="max-w-full mx-auto">
//             {children}
//           </div>
//         </main>
//       </div>
//     </div>
//   )
// }

// export default DashboardLayout




import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { fetchNotifications } from '../store/slices/loadRequestSlice'
import { 
  Menu, 
  X, 
  Home, 
  FileText, 
  History, 
  CheckCircle, 
  LogOut, 
  User,
  Bell,
  List,
  CheckCircle2,
  XCircle,
  AlertCircle as AlertCircleIcon,
  ChevronDown,
  ChevronRight,
  Package,
  Truck,
  Settings as SettingsIcon,
  BarChart3,
  Users as UsersIcon
} from 'lucide-react'

const DashboardLayout = ({ children, userRole, title, subtitle }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { notifications = [] } = useSelector((state) => state.loadRequest)
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [loadManagementOpen, setLoadManagementOpen] = useState(true)

  // Count unread notifications (if notifications exist in Redux store)
  const unreadCount = notifications && Array.isArray(notifications) 
    ? notifications.filter(n => n.status === 'Unread').length 
    : 0

  // Fetch notifications on mount and periodically
  useEffect(() => {
    if (user?.userId || user?.id) {
      const userId = user.userId || user.id
      // Fetch immediately
      dispatch(fetchNotifications(userId))
      
      // Fetch every 30 seconds for real-time updates
      const interval = setInterval(() => {
        dispatch(fetchNotifications(userId))
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [dispatch, user])

  // Log notifications for debugging
  useEffect(() => {
    console.log('Current notifications:', notifications)
    console.log('Unread count:', unreadCount)
  }, [notifications, unreadCount])

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen)
  }

  // Navigation structure
  const navigationStructure = {
    main: [
      { name: 'Dashboard', icon: Home, path: '/dashboard' }
    ],
    loadManagement: {
      title: 'Load Management',
      icon: FileText,
      items: userRole === 'LSR' 
        ? [
            { name: 'LSR', icon: FileText, path: '/lsr', indent: true },
            { name: 'Logistics Approval Agent', icon: UsersIcon, path: '/logistics-approval', indent: true, disabled: true }
          ]
        : [
            { name: 'LSR', icon: FileText, path: '/lsr', indent: true, disabled: true },
            { name: 'Logistics Approval Agent', icon: UsersIcon, path: '/logistics', indent: true }
          ]
    },
    modules: [
      { name: 'Products & Sales', icon: Package, path: '/products-sales', chevron: true },
      { name: 'Distribution & Delivery', icon: Truck, path: '/distribution', chevron: true },
      { name: 'Administration', icon: SettingsIcon, path: '/administration', chevron: true },
      { name: 'Reports & Analytics', icon: BarChart3, path: '/reports', chevron: true }
    ]
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

        {/* Navigation */}
        <nav className="flex-1 mt-6 px-4 overflow-y-auto">
          <div className="space-y-1 pb-4">
            {/* Main Dashboard */}
            {navigationStructure.main.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path)
                  setSidebarOpen(false)
                }}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg w-full text-left transition-all duration-200 ${
                  window.location.pathname === item.path
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 transition-colors duration-200 ${
                  window.location.pathname === item.path ? 'text-blue-700' : 'text-gray-500 group-hover:text-gray-700'
                }`} />
                {item.name}
              </button>
            ))}

            {/* Load Management Section */}
            <div className="mt-4">
              <button
                onClick={() => setLoadManagementOpen(!loadManagementOpen)}
                className="group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg w-full text-left transition-all duration-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
              >
                <div className="flex items-center">
                  <navigationStructure.loadManagement.icon className="mr-3 h-4 w-4 flex-shrink-0 text-blue-600" />
                  {navigationStructure.loadManagement.title}
                </div>
                {loadManagementOpen ? (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-blue-600" />
                )}
              </button>
              
              {/* Load Management Sub-items */}
              {loadManagementOpen && (
                <div className="mt-1 ml-3 space-y-1">
                  {navigationStructure.loadManagement.items.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (!item.disabled) {
                          navigate(item.path)
                          setSidebarOpen(false)
                        }
                      }}
                      disabled={item.disabled}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg w-full text-left transition-all duration-200 ${
                        window.location.pathname === item.path
                          ? 'bg-blue-50 text-blue-700'
                          : item.disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className={`mr-3 h-4 w-4 flex-shrink-0 transition-colors duration-200 ${
                        window.location.pathname === item.path 
                          ? 'text-blue-700' 
                          : item.disabled
                          ? 'text-gray-400'
                          : 'text-gray-500 group-hover:text-gray-700'
                      }`} />
                      {item.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modules Section */}
            <div className="mt-6">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                MODULES
              </div>
              <div className="space-y-1 mt-2">
                {navigationStructure.modules.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path)
                      setSidebarOpen(false)
                    }}
                    className="group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg w-full text-left transition-all duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  >
                    <div className="flex items-center">
                      <item.icon className="mr-3 h-4 w-4 flex-shrink-0 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
                      {item.name}
                    </div>
                    {item.chevron && (
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className="mt-auto p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleLogout}
            className="group flex items-center px-4 py-3 text-sm font-semibold text-gray-700 rounded-xl hover:bg-red-50 hover:text-red-700 w-full text-left transition-all duration-200"
          >
            <LogOut className="mr-4 h-5 w-5 flex-shrink-0 group-hover:text-red-600 transition-colors duration-200" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        {/* Top navigation */}
        <div className="flex-shrink-0 z-30 bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
                title="Toggle Sidebar"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-600 font-medium">{subtitle}</p>}
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200 relative"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <div className="absolute right-0 mt-3 w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 max-h-[32rem] overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-slate-50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 text-lg">Notifications</h3>
                        {unreadCount > 0 && (
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="overflow-y-auto max-h-[28rem]">
                      {!notifications || notifications.length === 0 ? (
                        <div className="p-8 text-gray-500 text-center">
                          <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p className="font-medium text-gray-700">No notifications</p>
                          <p className="text-sm mt-1">You're all caught up!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => {
                            // Determine notification type from message
                            const message = notification.message || ''
                            const isApproved = message.toLowerCase().includes('approved')
                            const isRejected = message.toLowerCase().includes('rejected')
                            
                            return (
                            <div
                              key={notification.notificationId}
                              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                                  notification.status === 'Unread' ? 'bg-slate-50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {/* Icon based on notification type */}
                                <div className="flex-shrink-0 mt-0.5">
                                  {isApproved ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                  ) : isRejected ? (
                                    <XCircle className="h-5 w-5 text-red-600" />
                                  ) : (
                                    <AlertCircleIcon className="h-5 w-5 text-slate-600" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${
                                    notification.status === 'Unread' ? 'font-semibold text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatNotificationDate(notification.createdOn)}
                                  </p>
                                </div>
                                {/* Unread indicator */}
                                {notification.status === 'Unread' && (
                                  <div className="flex-shrink-0">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )})}
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200 bg-gray-50 text-center">
                        <button className="text-sm font-medium text-slate-700 hover:text-slate-800">
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.userName}</p>
                  <p className="text-xs text-gray-600 font-medium">{user?.role}</p>
                </div>
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

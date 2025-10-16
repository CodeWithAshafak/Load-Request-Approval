import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRequests } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import { FileText, Clock, CheckCircle, History, ArrowRight } from 'lucide-react'

export default function LogisticsMain() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { requests } = useSelector((state) => state.loadRequest)

  useEffect(() => {
    if (user?.role === 'LOGISTICS') {
      dispatch(fetchRequests({}))
    }
  }, [dispatch, user])

  // Calculate counts
  const incomingCount = requests.filter(r => r.status === 'SUBMITTED').length
  const pendingCount = requests.filter(r => r.status === 'SUBMITTED').length
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length
  const totalCount = requests.length

  const cards = [
    {
      title: 'Incoming Requests',
      description: 'Newly submitted requests awaiting triage',
      count: incomingCount,
      icon: FileText,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      path: '/logistics/pending'
    },
    {
      title: 'Pending Requests',
      description: 'Requests currently pending your approval',
      count: pendingCount,
      icon: Clock,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      path: '/logistics/pending'
    },
    {
      title: 'Approved Requests',
      description: 'View all approved requests',
      count: approvedCount,
      icon: CheckCircle,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      path: '/logistics/approved'
    },
    {
      title: 'Requests History',
      description: 'Browse historical requests and decisions',
      count: totalCount,
      icon: History,
      color: 'gray',
      gradient: 'from-gray-600 to-gray-700',
      bgGradient: 'from-gray-50 to-gray-100',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      path: '/logistics/history'
    }
  ]

  return (
    <DashboardLayout 
      userRole="LOGISTICS" 
      title="Logistics Main" 
      subtitle="Choose where to go"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Logistics Main</h1>
          <p className="text-lg text-gray-600">Choose where to go</p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon
            return (
              <button
                key={index}
                onClick={() => navigate(card.path)}
                className={`group relative bg-gradient-to-br ${card.bgGradient} border-2 ${card.borderColor} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left overflow-hidden`}
              >
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
                
                {/* Icon */}
                <div className={`relative mb-4 w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <div className="relative">
                  <h3 className={`text-xl font-bold ${card.textColor} mb-2 group-hover:text-opacity-90 transition-colors`}>
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    {card.description}
                  </p>
                  
                  {/* Count Badge */}
                  <div className="flex items-center justify-between">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm ${card.textColor}`}>
                      {card.count} {card.count === 1 ? 'Request' : 'Requests'}
                    </div>
                    <ArrowRight className={`h-5 w-5 ${card.textColor} opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300`} />
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className={`absolute inset-0 border-2 border-transparent group-hover:border-${card.color}-400 rounded-2xl transition-colors duration-300`}></div>
              </button>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{incomingCount}</p>
              <p className="text-sm text-gray-600 mt-1">Incoming</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{pendingCount}</p>
              <p className="text-sm text-gray-600 mt-1">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{approvedCount}</p>
              <p className="text-sm text-gray-600 mt-1">Approved</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-600">{totalCount}</p>
              <p className="text-sm text-gray-600 mt-1">Total</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

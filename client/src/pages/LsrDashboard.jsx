import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRequests, submitRequest } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import { 
  Plus, 
  Eye, 
  Edit, 
  Send, 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Calendar,
  MapPin,
  Package,
  Filter,
  Search,
  MoreVertical,
  Download,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

export default function LsrDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { requests, loading, error } = useSelector((state) => state.loadRequest)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('createdAt')
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)

  useEffect(() => {
    if (user?.role === 'LSR') {
      dispatch(fetchRequests({ lsrId: user.userId }))
    }
  }, [dispatch, user])

  const exportToCSV = () => {
    // Prepare CSV data
    const csvData = filteredRequests.map(request => ({
      'Request Number': request.requestNumber,
      'Status': request.status,
      'Priority': request.priority || 'N/A',
      'Route': request.route || 'N/A',
      'Created Date': formatDate(request.createdAt),
      'Submitted Date': request.submittedAt ? formatDate(request.submittedAt) : 'N/A',
      'Commercial Products': request.commercialProducts.length,
      'POSM Items': request.posmItems.length,
      'Total Items': request.commercialProducts.length + request.posmItems.length,
      'Notes': request.notes || 'N/A'
    }))

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in values
          return typeof value === 'string' && (value.includes(',') || value.includes('"'))
            ? `"${value.replace(/"/g, '""')}"`
            : value
        }).join(',')
      )
    ].join('\n')

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `LSR_Requests_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSubmitRequest = async (requestId) => {
    try {
      const result = await dispatch(submitRequest(requestId))
      if (result.meta.requestStatus === 'fulfilled') {
        // Refresh the requests list
        dispatch(fetchRequests({ lsrId: user.userId }))
      }
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const handleViewRequest = (request) => {
    console.log('📋 Opening request details:', request)
    setSelectedRequest(request)
    setViewModalOpen(true)
    console.log('✅ Modal state set to open')
  }

  const closeViewModal = () => {
    setViewModalOpen(false)
    setSelectedRequest(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SUBMITTED': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filter and sort requests
  const filteredRequests = requests
    .filter(request => {
      const matchesSearch = request.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.route?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'requestNumber':
          return a.requestNumber?.localeCompare(b.requestNumber)
        default:
          return 0
      }
    })

  // Calculate statistics
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'SUBMITTED').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    drafts: requests.filter(r => r.status === 'DRAFT').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length
  }

  return (
    <DashboardLayout 
      userRole="LSR" 
      title="Load Service Dashboard" 
      subtitle="Manage and track your load service requests"
    >
      {/* Error Alert */}
      {error && (
        <div className="mb-8 bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.userName}!</h1>
              <p className="text-slate-200 text-lg">Here's what's happening with your load requests today.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/lsr/new')}
            className="group relative inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <Plus className="h-6 w-6 mr-3 group-hover:rotate-90 transition-transform duration-200" />
            Create New Request
          </button>
          <button
            onClick={() => navigate('/lsr/history')}
            className="group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-xl text-gray-700 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <FileText className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
            View History
          </button>
          <button
            onClick={exportToCSV}
            disabled={filteredRequests.length === 0}
            className="group inline-flex items-center px-6 py-4 text-lg font-semibold rounded-xl text-gray-600 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Download className="h-6 w-6 mr-3 group-hover:scale-110 transition-transform duration-200" />
            Export to CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Total Requests */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Approved Requests */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                <p className="text-xs text-gray-500 mt-1">Ready for dispatch</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Draft Requests */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
                <p className="text-3xl font-bold text-gray-600">{stats.drafts}</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Edit className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Rejected Requests */}
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-gray-500 mt-1">Need revision</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Load Requests</h3>
              <p className="text-gray-600">Manage and track your load service requests</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="SUBMITTED">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="createdAt">Sort by Date</option>
                <option value="status">Sort by Status</option>
                <option value="requestNumber">Sort by Request #</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-lg text-gray-600 font-medium">Loading requests...</p>
            <p className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'ALL' ? 'No matching requests' : 'No requests yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Try adjusting your search criteria or filters to find what you\'re looking for.'
                : 'Get started by creating your first load service request.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/lsr/new')}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Request
              </button>
              {(searchTerm || statusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setStatusFilter('ALL')
                  }}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
          <div className="divide-y divide-gray-200">
            {(() => {
              const indexOfLastItem = currentPage * itemsPerPage;
              const indexOfFirstItem = indexOfLastItem - itemsPerPage;
              const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
              return currentRequests.map((request) => (
              <div key={request.id} className="group p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                      {request.priority && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          request.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          request.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.priority}
                        </span>
                      )}
                      <h4 className="text-lg font-semibold text-gray-900 truncate">
                        Request #{request.requestNumber}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">Created:</span>
                        <span className="ml-1">{formatDate(request.createdAt)}</span>
                      </div>
                      
                      {request.route && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          <span className="font-medium">Route:</span>
                          <span className="ml-1 truncate">{request.route}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="font-medium">Items:</span>
                        <span className="ml-1">
                          {request.commercialProducts.length} Products, {request.posmItems.length} POSM
                        </span>
                      </div>
                    </div>
                    
                    {request.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notes:</span> {request.notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    
                    {request.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmitRequest(request.id)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Submit Request"
                      >
                        <Send className="h-5 w-5" />
                      </button>
                    )}
                    
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      title="More Options"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ));
            })()}
          </div>
          
          {/* Pagination Controls */}
          {filteredRequests.length > itemsPerPage && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredRequests.length)} of {filteredRequests.length} requests
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-700 font-medium"
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.ceil(filteredRequests.length / itemsPerPage) }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                          currentPage === page
                            ? 'bg-slate-700 text-white shadow-lg'
                            : 'hover:bg-gray-200 text-gray-700 border border-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredRequests.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredRequests.length / itemsPerPage)}
                    className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-gray-700 font-medium"
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
          </>
        )}
      </div>

      {/* View Request Modal */}
      {console.log('🔍 Modal render check:', { viewModalOpen, hasSelectedRequest: !!selectedRequest })}
      {viewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && closeViewModal()}>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-700 to-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-600">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Request Details
                </h3>
                <p className="text-slate-200 text-sm mt-1">#{selectedRequest.requestNumber}</p>
              </div>
              <button 
                onClick={closeViewModal} 
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-all duration-200"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Request Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Request Number</p>
                    <p className="text-lg font-bold text-gray-900">{selectedRequest.requestNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Created At</p>
                    <p className="text-base text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  {selectedRequest.submittedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Submitted At</p>
                      <p className="text-base text-gray-900">{formatDate(selectedRequest.submittedAt)}</p>
                    </div>
                  )}
                  {selectedRequest.priority && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Priority</p>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedRequest.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        selectedRequest.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        selectedRequest.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                  )}
                  {selectedRequest.route && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Route</p>
                      <p className="text-base text-gray-900">{selectedRequest.route}</p>
                    </div>
                  )}
                  {selectedRequest.expectedDeliveryDate && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Expected Delivery Date</p>
                      <p className="text-base text-gray-900">{new Date(selectedRequest.expectedDeliveryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}
                  {selectedRequest.decidedAt && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Decision Date</p>
                      <p className="text-base text-gray-900">{formatDate(selectedRequest.decidedAt)}</p>
                    </div>
                  )}
                </div>
                {selectedRequest.notes && (
                  <div className="mt-6 pt-6 border-t border-gray-300">
                    <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                    <p className="text-sm text-gray-900 bg-white p-4 rounded-lg border border-gray-200">
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}
                {selectedRequest.decisionReason && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      {selectedRequest.status === 'APPROVED' ? 'Approval Reason' : 'Rejection Reason'}
                    </p>
                    <p className={`text-sm p-4 rounded-lg border ${
                      selectedRequest.status === 'APPROVED' 
                        ? 'bg-green-50 text-green-900 border-green-200' 
                        : 'bg-red-50 text-red-900 border-red-200'
                    }`}>
                      {selectedRequest.decisionReason}
                    </p>
                  </div>
                )}
              </div>

              {/* Commercial Products */}
              {selectedRequest.commercialProducts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Commercial Products ({selectedRequest.commercialProducts.length})
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedRequest.commercialProducts.map((product, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.sku}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{product.uom}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">{product.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* POSM Items */}
              {selectedRequest.posmItems.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    POSM Items ({selectedRequest.posmItems.length})
                  </h4>
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedRequest.posmItems.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.description}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.code}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">{item.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={closeViewModal}
                className="px-6 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                Close
              </button>
              {selectedRequest.status === 'DRAFT' && (
                <button
                  onClick={() => {
                    closeViewModal()
                    handleSubmitRequest(selectedRequest.id)
                  }}
                  className="px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-all duration-200 flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Request
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRequests, submitRequest } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import Pagination from '../components/Pagination'
import { 
  Plus, 
  Eye, 
  Send, 
  FileText, 
  AlertCircle,
  Calendar,
  MapPin,
  Package,
  Search,
  MoreVertical,
  X
} from 'lucide-react'

export default function LoadRequestsList() {
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

  const handleSubmitRequest = async (requestId) => {
    try {
      const result = await dispatch(submitRequest(requestId))
      if (result.meta.requestStatus === 'fulfilled') {
        dispatch(fetchRequests({ lsrId: user.userId }))
      }
    } catch (error) {
      console.error('Submit failed:', error)
    }
  }

  const handleViewRequest = (request) => {
    setSelectedRequest(request)
    setViewModalOpen(true)
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

  return (
    <DashboardLayout 
      userRole="LSR" 
      title="Load Requests" 
      subtitle="View and manage your load service requests"
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

      {/* Search and Filter Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">All Load Requests</h3>
              <p className="text-gray-600">View and manage your load service requests</p>
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
                  className="pl-10 pr-4 py-3 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
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
          
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={filteredRequests.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="requests"
          />
          </>
        )}

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">All Load Requests</h3>
                  <p className="text-gray-600">View and manage your load service requests</p>
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
                      className="pl-10 pr-4 py-3 w-full sm:w-64 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex items-center justify-between border-b border-blue-500">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Request Details
                </h3>
                <p className="text-blue-100 text-sm mt-1">#{selectedRequest.requestNumber}</p>
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
                  {selectedRequest.route && (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Route</p>
                      <p className="text-base text-gray-900">{selectedRequest.route}</p>
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

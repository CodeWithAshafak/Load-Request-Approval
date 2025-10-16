import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRequests } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import { ArrowLeft, Eye, X } from 'lucide-react'

export default function LsrPendingRequests() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { requests, loading } = useSelector((state) => state.loadRequest)
  
  const [filterType, setFilterType] = useState('All')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (user?.role === 'LSR') {
      // Fetch all requests for this LSR
      dispatch(fetchRequests({ lsrId: user.userId }))
    }
  }, [dispatch, user])

  // Filter only SUBMITTED (pending) requests
  const pendingRequests = requests.filter(r => r.status === 'SUBMITTED')
  
  console.log('📊 Total requests:', requests.length)
  console.log('📋 Pending requests:', pendingRequests.length)
  console.log('🔍 Requests data:', requests)

  // Apply type filter
  const filteredRequests = pendingRequests.filter(request => {
    if (filterType === 'All') return true
    if (filterType === 'Commercial') return request.commercialProducts.length > 0
    if (filterType === 'POSM') return request.posmItems.length > 0
    return true
  })

  const handleViewDetails = (request) => {
    console.log('Opening request details:', request)
    setSelectedRequest(request)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedRequest(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    })
  }

  const calculateTotalAmount = (products) => {
    return products.reduce((sum, item) => sum + (item.totalValue || item.amount || 0), 0)
  }

  const countCommercial = filteredRequests.filter(r => r.commercialProducts.length > 0).length
  const countPOSM = filteredRequests.filter(r => r.posmItems.length > 0).length

  return (
    <DashboardLayout 
      userRole="LSR" 
      title="Pending Requests" 
      subtitle="View and track your pending load service requests"
    >
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/lsr')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Requests</h1>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex items-center space-x-4">
        <span className="text-sm font-medium text-gray-700">Filter:</span>
        <button
          onClick={() => setFilterType('All')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'All'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({pendingRequests.length})
        </button>
        <button
          onClick={() => setFilterType('Commercial')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'Commercial'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Commercial ({countCommercial})
        </button>
        <button
          onClick={() => setFilterType('POSM')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterType === 'POSM'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          POSM ({countPOSM})
        </button>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600 font-medium">Loading requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
          <p className="text-gray-500 mb-6">
            {filterType !== 'All' 
              ? `No ${filterType.toLowerCase()} requests found. Try changing the filter.`
              : 'You don\'t have any pending requests at the moment. Create a new load request to get started.'
            }
          </p>
          {filterType === 'All' && (
            <button
              onClick={() => navigate('/lsr/load-request')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Request
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Load
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.requestNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {request.commercialProducts.length > 0 ? 'Commercial' : 'POSM'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.route || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.commercialProducts.length + request.posmItems.length}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      SUBMITTED
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewDetails(request)}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-5 w-5 inline-block" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={closeModal}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.requestNumber}</h2>
                    <p className="text-sm text-gray-500">Created: {formatDate(selectedRequest.createdAt)}</p>
                  </div>
                </div>
              </div>
              <div>
                <span className="inline-flex px-4 py-2 text-sm font-semibold rounded-lg bg-yellow-100 text-yellow-800">
                  SUBMITTED
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Request Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">LSR ID</p>
                  <p className="text-base text-gray-900">{selectedRequest.lsrId || user.userId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Priority</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedRequest.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    selectedRequest.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    selectedRequest.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedRequest.priority || 'MEDIUM'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Route</p>
                  <p className="text-base text-gray-900">{selectedRequest.route || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Submitted At</p>
                  <p className="text-base text-gray-900">{formatDate(selectedRequest.submittedAt || selectedRequest.createdAt)}</p>
                </div>
              </div>

              {/* Commercial Products */}
              {selectedRequest.commercialProducts.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Commercial Products ({selectedRequest.commercialProducts.length})
                      <span className="ml-3 text-green-600">
                        Total: ₹{calculateTotalAmount(selectedRequest.commercialProducts).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      ⛶ Full Screen
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Approved Qty</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRequest.commercialProducts.map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{product.sku}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.uom || 'CASE'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              ₹{(product.unitPrice || product.mrp || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {product.qty || 0}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right">0</td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                              ₹{(product.totalValue || product.amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* POSM Items */}
              {selectedRequest.posmItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    POSM Items ({selectedRequest.posmItems.length})
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRequest.posmItems.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{item.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedRequest.notes && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Notes</h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700">{selectedRequest.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

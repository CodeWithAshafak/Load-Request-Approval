import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRequests } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import { CheckCircle, Eye, Package, Calendar, User, ArrowLeft } from 'lucide-react'

export default function ApprovedList() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { requests, loading } = useSelector((state) => state.loadRequest)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchRequests({ lsrId: user.userId, status: 'APPROVED' }))
    }
  }, [dispatch, user])

  const approvedRequests = requests.filter(r => r.status === 'APPROVED')

  const openDetailsModal = (request) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedRequest(null)
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout 
      userRole="LSR" 
      title="Approved Requests" 
      subtitle="View all your approved load service requests"
    >
      <div className="mb-6">
        <button
          onClick={() => navigate('/lsr')}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      ) : approvedRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Requests</h3>
          <p className="text-gray-500">You don't have any approved requests yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Request #{request.requestNumber}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Submitted: {formatDate(request.submittedAt)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Approved: {formatDate(request.decidedAt)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{request.commercialProducts?.length || 0} Products, {request.posmItems?.length || 0} POSM</span>
                      </div>
                    </div>

                    {request.route && (
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Route:</span> {request.route}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => openDetailsModal(request)}
                    className="ml-4 p-2 text-green-600 hover:text-green-800 rounded-md hover:bg-green-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Request #{selectedRequest.requestNumber}
              </h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <div className="p-6">
              {/* Status and Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Status: Approved</p>
                    <p className="text-sm text-green-600 mt-1">Approved on {formatDate(selectedRequest.decidedAt)}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              {/* Request Details */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Request Number</p>
                  <p className="text-base font-semibold text-gray-900">{selectedRequest.requestNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Route</p>
                  <p className="text-base text-gray-900">{selectedRequest.route || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted At</p>
                  <p className="text-base text-gray-900">{formatDate(selectedRequest.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Approved At</p>
                  <p className="text-base text-gray-900">{formatDate(selectedRequest.decidedAt)}</p>
                </div>
              </div>

              {/* Commercial Products */}
              {selectedRequest.commercialProducts && selectedRequest.commercialProducts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Commercial Products</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRequest.commercialProducts.map((product, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.sku}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.uom}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{product.qty}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">₹{product.unitPrice?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{product.totalValue?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* POSM Items */}
              {selectedRequest.posmItems && selectedRequest.posmItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">POSM Items</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Value</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedRequest.posmItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">{item.qty}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">₹{item.unitValue?.toFixed(2) || '0.00'}</td>
                            <td className="px-4 py-3 text-sm text-right font-medium text-gray-900">₹{item.totalValue?.toFixed(2) || '0.00'}</td>
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
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">{selectedRequest.notes}</p>
                </div>
              )}

              {/* Total Value */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Value</span>
                  <span className="text-2xl font-bold text-green-600">₹{selectedRequest.totalValue?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

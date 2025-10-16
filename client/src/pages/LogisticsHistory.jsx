import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRequests } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import { Filter, Eye, Download, FileText, ArrowLeft, X, Package } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function LogisticsHistory() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { requests, loading, error } = useSelector((state) => state.loadRequest)

  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    if (user?.role === 'LOGISTICS') {
      dispatch(fetchRequests({})) // Fetch all requests
    }
  }, [dispatch, user])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'MEDIUM': return 'bg-blue-100 text-blue-800'
      case 'LOW': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredRequests = requests.filter(request => {
    return statusFilter === 'ALL' || request.status === statusFilter
  })

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedRequest(null)
  }

  const downloadPDF = (request) => {
    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(20)
    doc.setTextColor(40)
    doc.text('Load Service Request', 14, 22)
    
    // Request Info
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`Request #: ${request.requestNumber}`, 14, 35)
    doc.text(`Status: ${request.status}`, 14, 42)
    doc.text(`Priority: ${request.priority || 'N/A'}`, 14, 49)
    doc.text(`Route: ${request.route || 'N/A'}`, 14, 56)
    doc.text(`Submitted: ${formatDate(request.submittedAt || request.createdAt)}`, 14, 63)
    
    let currentY = 75
    
    // Commercial Products Table
    if (request.commercialProducts.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(40)
      doc.text('Commercial Products', 14, currentY)
      
      const commercialData = request.commercialProducts.map(p => [
        p.sku,
        p.name,
        p.uom || 'CASE',
        p.qty || 0,
        `Rs ${(p.unitPrice || 0).toFixed(2)}`,
        `Rs ${(p.totalValue || 0).toFixed(2)}`
      ])
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['SKU', 'Product Name', 'UOM', 'Qty', 'Unit Price', 'Total']],
        body: commercialData,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105] },
        styles: { fontSize: 9 }
      })
      
      currentY = doc.lastAutoTable.finalY + 10
    }
    
    // POSM Items Table
    if (request.posmItems.length > 0) {
      doc.setFontSize(14)
      doc.setTextColor(40)
      doc.text('POSM Items', 14, currentY)
      
      const posmData = request.posmItems.map(p => [
        p.code,
        p.description,
        p.qty || 0
      ])
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Code', 'Description', 'Quantity']],
        body: posmData,
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105] },
        styles: { fontSize: 9 }
      })
      
      currentY = doc.lastAutoTable.finalY + 10
    }
    
    // Notes
    if (request.notes) {
      doc.setFontSize(12)
      doc.setTextColor(100)
      doc.text('Notes:', 14, currentY)
      doc.setFontSize(10)
      const splitNotes = doc.splitTextToSize(request.notes, 180)
      doc.text(splitNotes, 14, currentY + 7)
    }
    
    // Save PDF
    doc.save(`Request_${request.requestNumber}.pdf`)
  }

  return (
    <DashboardLayout 
      userRole="LOGISTICS" 
      title="Request History" 
      subtitle="View all load service requests"
    >
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/logistics')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Main
        </button>
      </div>

      {/* Header with Filter */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Request History</h1>
        <div className="flex items-center space-x-3">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading history...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg">No requests found</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {request.requestNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.route || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority || 'MEDIUM'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.submittedAt || request.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.commercialProducts.length + request.posmItems.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.commercialProducts.reduce((sum, p) => sum + (p.qty || 0), 0) + 
                       request.posmItems.reduce((sum, p) => sum + (p.qty || 0), 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="text-gray-600 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => downloadPDF(request)}
                          className="text-gray-600 hover:text-green-600 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.requestNumber}</h2>
                <p className="text-sm text-gray-500">
                  {selectedRequest.status === 'APPROVED' && `Approved: ${formatDate(selectedRequest.decidedAt)}`}
                  {selectedRequest.status === 'REJECTED' && `Rejected: ${formatDate(selectedRequest.decidedAt)}`}
                  {selectedRequest.status === 'SUBMITTED' && `Submitted: ${formatDate(selectedRequest.submittedAt)}`}
                  {selectedRequest.status === 'DRAFT' && `Created: ${formatDate(selectedRequest.createdAt)}`}
                </p>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Request Info */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Priority</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(selectedRequest.priority)}`}>
                    {selectedRequest.priority || 'MEDIUM'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Route</p>
                  <p className="text-base text-gray-900">{selectedRequest.route || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">LSR ID</p>
                  <p className="text-base text-gray-900">{selectedRequest.lsrId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Submitted At</p>
                  <p className="text-base text-gray-900">{formatDate(selectedRequest.submittedAt || selectedRequest.createdAt)}</p>
                </div>
                {selectedRequest.decidedAt && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Decision Date</p>
                    <p className="text-base text-gray-900">{formatDate(selectedRequest.decidedAt)}</p>
                  </div>
                )}
              </div>

              {/* Commercial Products */}
              {selectedRequest.commercialProducts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    Commercial Products ({selectedRequest.commercialProducts.length})
                  </h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
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
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{product.sku}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{product.uom || 'CASE'}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{product.qty || 0}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              ₹{(product.unitPrice || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-green-600 text-right">
                              ₹{(product.totalValue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan="5" className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                            Total Amount:
                          </td>
                          <td className="px-4 py-3 text-right text-base font-bold text-green-600">
                            ₹{selectedRequest.commercialProducts
                              .reduce((sum, p) => sum + (p.totalValue || 0), 0)
                              .toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* POSM Items */}
              {selectedRequest.posmItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
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

              {/* Rejection Reason */}
              {selectedRequest.decisionReason && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-red-900 mb-2">Rejection Reason</h3>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-sm text-red-700">{selectedRequest.decisionReason}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={() => downloadPDF(selectedRequest)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </button>
              <button
                onClick={closeDetailsModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRequests } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import Pagination from '../components/Pagination'
import { Filter, Eye, Download, X, Package, FileText, Clock, CheckCircle, History } from 'lucide-react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function LogisticsApproved() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { requests, loading, error } = useSelector((state) => state.loadRequest)

  const [dateFilter, setDateFilter] = useState('ALL')
  const [lsrFilter, setLsrFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    if (user?.role === 'LOGISTICS') {
      dispatch(fetchRequests({ status: 'APPROVED' }))
    }
  }, [dispatch, user])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredRequests = requests.filter(request => {
    const dateMatch = dateFilter === 'ALL' || 
      (dateFilter === 'TODAY' && new Date(request.decidedAt).toDateString() === new Date().toDateString()) ||
      (dateFilter === 'WEEK' && (new Date() - new Date(request.decidedAt)) <= 7 * 24 * 60 * 60 * 1000) ||
      (dateFilter === 'MONTH' && (new Date() - new Date(request.decidedAt)) <= 30 * 24 * 60 * 60 * 1000)
    
    const lsrMatch = lsrFilter === 'ALL' || request.lsrId === lsrFilter
    
    return dateMatch && lsrMatch
  })

  const uniqueLsrIds = [...new Set(requests.map(req => req.lsrId))]

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
    doc.text('Approved Load Service Request', 14, 22)
    
    // Request Info
    doc.setFontSize(12)
    doc.setTextColor(100)
    doc.text(`Request #: ${request.requestNumber}`, 14, 35)
    doc.text(`Status: APPROVED`, 14, 42)
    doc.text(`Priority: ${request.priority || 'N/A'}`, 14, 49)
    doc.text(`Route: ${request.route || 'N/A'}`, 14, 56)
    doc.text(`Submitted: ${formatDate(request.submittedAt)}`, 14, 63)
    doc.text(`Approved: ${formatDate(request.decidedAt)}`, 14, 70)
    
    let currentY = 82
    
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
        headStyles: { fillColor: [34, 197, 94] },
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
        headStyles: { fillColor: [34, 197, 94] },
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
    doc.save(`Approved_Request_${request.requestNumber}.pdf`)
  }

  return (
    <DashboardLayout
      userRole="LOGISTICS"
      title="Approved Requests"
      subtitle="View all approved load requests"
    >
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="WEEK">This Week</option>
              <option value="MONTH">This Month</option>
            </select>

            <select
              value={lsrFilter}
              onChange={(e) => setLsrFilter(e.target.value)}
              className="border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="ALL">All LSRs</option>
              {uniqueLsrIds.map(lsrId => (
                <option key={lsrId} value={lsrId}>{lsrId}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Colorful Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Incoming Requests Card */}
        <button
          onClick={() => navigate('/logistics/pending')}
          className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative mb-4 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <FileText className="h-7 w-7 text-white" />
          </div>

          <div className="relative">
            <h3 className="text-xl font-bold text-blue-700 mb-2 group-hover:text-opacity-90 transition-colors">
              Incoming Requests
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Newly submitted requests awaiting triage
            </p>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm text-blue-700">
              View All
            </div>
          </div>
        </button>

        {/* Pending Requests Card */}
        <button
          onClick={() => navigate('/logistics/pending')}
          className="group relative bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative mb-4 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <Clock className="h-7 w-7 text-white" />
          </div>

          <div className="relative">
            <h3 className="text-xl font-bold text-orange-700 mb-2 group-hover:text-opacity-90 transition-colors">
              Pending Requests
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Requests currently pending your approval
            </p>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm text-orange-700">
              View All
            </div>
          </div>
        </button>

        {/* Approved Requests Card */}
        <button
          onClick={() => navigate('/logistics/approved')}
          className="group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative mb-4 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <CheckCircle className="h-7 w-7 text-white" />
          </div>

          <div className="relative">
            <h3 className="text-xl font-bold text-green-700 mb-2 group-hover:text-opacity-90 transition-colors">
              Approved Requests
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              View all approved requests
            </p>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm text-green-700">
              {filteredRequests.length} {filteredRequests.length === 1 ? 'Request' : 'Requests'}
            </div>
          </div>
        </button>

        {/* Requests History Card */}
        <button
          onClick={() => navigate('/logistics/history')}
          className="group relative bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <div className="relative mb-4 w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
            <History className="h-7 w-7 text-white" />
          </div>

          <div className="relative">
            <h3 className="text-xl font-bold text-gray-700 mb-2 group-hover:text-opacity-90 transition-colors">
              Requests History
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Browse historical requests and decisions
            </p>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm text-gray-700">
              View All
            </div>
          </div>
        </button>
      </div>

      {/* Main Content */}
      <div>
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Approved Requests ({filteredRequests.length})
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              All approved load service requests
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading approved requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No approved requests found</p>
            </div>
          ) : (
            <>
            <ul className="divide-y divide-gray-200">
              {(() => {
                const indexOfLastItem = currentPage * itemsPerPage;
                const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
                return currentRequests.map((request) => (
                <li key={request.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            APPROVED
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
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              Request #{request.requestNumber}
                            </p>
                          </div>
                          <div className="mt-1">
                            <p className="text-sm text-gray-500">
                              LSR: {request.lsrId}
                            </p>
                            <p className="text-sm text-gray-500">
                              Submitted: {formatDate(request.submittedAt)}
                            </p>
                            <p className="text-sm text-gray-500">
                              Approved: {formatDate(request.decidedAt)}
                              {request.approverId && ` by ${request.approverId}`}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500 mr-4">
                          <span className="font-medium">{request.commercialProducts.length}</span> Products, 
                          <span className="font-medium"> {request.posmItems.length}</span> POSM
                        </div>
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => downloadPDF(request)}
                          className="p-2 text-green-600 hover:text-green-800 rounded-md hover:bg-green-50 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    {request.route && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Route:</span> {request.route}
                        </p>
                      </div>
                    )}
                    
                    {request.notes && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {request.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ));
              })()}
            </ul>
            
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
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.requestNumber}</h2>
                <p className="text-sm text-gray-500">Approved: {formatDate(selectedRequest.decidedAt)}</p>
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
                  <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                    APPROVED
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Priority</p>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedRequest.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    selectedRequest.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
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
                  <p className="text-base text-gray-900">{formatDate(selectedRequest.submittedAt)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Approved At</p>
                  <p className="text-base text-gray-900">{formatDate(selectedRequest.decidedAt)}</p>
                </div>
              </div>

              {/* Commercial Products */}
              {selectedRequest.commercialProducts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-green-600" />
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
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
              <button
                onClick={() => downloadPDF(selectedRequest)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
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

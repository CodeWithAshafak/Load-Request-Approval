import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchRequests, approveRequest, rejectRequest, fetchNotifications } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import Pagination from '../components/Pagination'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { generateRequestPDF, generateMultipleRequestsPDF } from '../utils/pdfGenerator'
import { Check, X, Eye, Clock, Users, Search, Filter, Package, AlertCircle, CheckCircle2, XCircle, RefreshCw, ChevronDown, ChevronUp, Edit2, Save, Download, FileText } from 'lucide-react'

export default function LogisticsDashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { requests, loading, error } = useSelector((state) => state.loadRequest)

  const [rejectReason, setRejectReason] = useState('')
  const [rejectingId, setRejectingId] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterPriority, setFilterPriority] = useState('ALL')
  const [filterType, setFilterType] = useState('ALL') // 'ALL', 'INCOMING', 'PENDING'
  const [selectedRequests, setSelectedRequests] = useState([])
  const [expandedRequests, setExpandedRequests] = useState(new Set())
  const [sortBy, setSortBy] = useState('submittedAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [editMode, setEditMode] = useState(false)
  const [editedProducts, setEditedProducts] = useState([])
  const [editedPosm, setEditedPosm] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [isExporting, setIsExporting] = useState(false)
  const { toasts, removeToast, success, warning, info } = useToast()

  useEffect(() => {
    if (user?.role === 'LOGISTICS') {
      dispatch(fetchRequests({ status: 'SUBMITTED' }))
    }
  }, [dispatch, user])

  const handleApprove = async (requestId, modifiedRequest = null) => {
    try {
      const modifiedData = modifiedRequest ? {
        commercialProducts: modifiedRequest.commercialProducts,
        posmItems: modifiedRequest.posmItems
      } : null
      
      const result = await dispatch(approveRequest({ 
        id: requestId, 
        modifiedData 
      }))
      if (result.meta.requestStatus === 'fulfilled') {
        const requestNumber = result.payload.requestNumber
        const lsrId = result.payload.lsrId
        if (modifiedData) {
          success(`✅ Request #${requestNumber} approved with modified quantities!`)
        } else {
          success(`✅ Request #${requestNumber} approved successfully!`)
        }
        // Refresh the requests list
        dispatch(fetchRequests({ status: 'SUBMITTED' }))
        // Trigger notification for LSR user
        if (lsrId) {
          dispatch(fetchNotifications(lsrId))
        }
      } else {
        error('❌ Failed to approve request. Please try again.')
      }
    } catch (err) {
      console.error('Approve failed:', err)
      error('❌ Failed to approve request. Please try again.')
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      warning('⚠️ Please provide a reason for rejection')
      return
    }
    
    try {
      const result = await dispatch(rejectRequest({ id: rejectingId, reason: rejectReason }))
      if (result.meta.requestStatus === 'fulfilled') {
        const requestNumber = result.payload.requestNumber
        const lsrId = result.payload.lsrId
        success(`✅ Request #${requestNumber} rejected successfully`)
        setShowRejectModal(false)
        setRejectReason('')
        setRejectingId(null)
        // Refresh the requests list
        dispatch(fetchRequests({ status: 'SUBMITTED' }))
        // Trigger notification for LSR user
        if (lsrId) {
          dispatch(fetchNotifications(lsrId))
        }
      } else {
        error('❌ Failed to reject request. Please try again.')
      }
    } catch (err) {
      console.error('Reject failed:', err)
      error('❌ Failed to reject request. Please try again.')
    }
  }

  const openRejectModal = (requestId) => {
    setRejectingId(requestId)
    setShowRejectModal(true)
  }

  const closeRejectModal = () => {
    setShowRejectModal(false)
    setRejectReason('')
    setRejectingId(null)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleRefresh = () => {
    dispatch(fetchRequests({ status: 'SUBMITTED' }))
    info('🔄 Refreshing requests...')
  }

  // Export to CSV function
  const handleExportToCSV = () => {
    setIsExporting(true)
    
    try {
      // Prepare CSV data
      const csvRows = []
      
      // Add headers
      csvRows.push(['Request Number', 'LSR ID', 'Status', 'Route', 'Created Date', 'Submitted Date', 'Decided Date', 'Priority', 'Total Items', 'Total Value', 'Approver', 'Notes'].join(','))
      
      // Add data rows
      requests.forEach(request => {
        const row = [
          request.requestNumber || '',
          request.lsrId || '',
          request.status || '',
          request.route || '',
          request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '',
          request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : '',
          request.decidedAt ? new Date(request.decidedAt).toLocaleDateString() : '',
          request.priority || '',
          (request.commercialProducts?.length || 0) + (request.posmItems?.length || 0),
          request.totalValue || 0,
          request.approverName || '',
          `"${(request.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
        ]
        csvRows.push(row.join(','))
      })
      
      // Create CSV content
      const csvContent = csvRows.join('\n')
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `Logistics_Requests_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      success('✅ CSV exported successfully')
    } catch (error) {
      console.error('❌ Error exporting CSV:', error)
      warning('Failed to export CSV. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleViewDetails = (request) => {
    setSelectedRequest(request)
    setEditedProducts(JSON.parse(JSON.stringify(request.commercialProducts)))
    setEditedPosm(JSON.parse(JSON.stringify(request.posmItems)))
    setEditMode(false)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedRequest(null)
    setEditMode(false)
    setEditedProducts([])
    setEditedPosm([])
  }

  const handleEditQuantity = () => {
    setEditMode(true)
  }

  const handleCancelEdit = () => {
    setEditedProducts(JSON.parse(JSON.stringify(selectedRequest.commercialProducts)))
    setEditedPosm(JSON.parse(JSON.stringify(selectedRequest.posmItems)))
    setEditMode(false)
  }

  const handleSaveQuantities = () => {
    // Update the selected request with edited quantities
    const updatedRequest = {
      ...selectedRequest,
      commercialProducts: editedProducts,
      posmItems: editedPosm
    }
    setSelectedRequest(updatedRequest)
    setEditMode(false)
    // Show success message
    info('💾 Quantities updated! Click Approve to save permanently.', 6000)
  }

  const updateProductQuantity = (index, newQty) => {
    const updated = [...editedProducts]
    const qty = parseInt(newQty) || 0
    const unitPrice = updated[index].unitPrice || 0
    const totalValue = qty * unitPrice
    updated[index] = { 
      ...updated[index], 
      qty: qty,
      totalValue: totalValue
    }
    setEditedProducts(updated)
  }

  const updatePosmQuantity = (index, newQty) => {
    const updated = [...editedPosm]
    updated[index] = { ...updated[index], qty: parseInt(newQty) || 0 }
    setEditedPosm(updated)
  }

  const toggleRequestExpand = (requestId) => {
    const newExpanded = new Set(expandedRequests)
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId)
    } else {
      newExpanded.add(requestId)
    }
    setExpandedRequests(newExpanded)
  }

  const toggleSelectRequest = (requestId) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([])
    } else {
      setSelectedRequests(filteredRequests.map(r => r.id))
    }
  }

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return
    if (!window.confirm(`Approve ${selectedRequests.length} request(s)?`)) return
    
    info(`⏳ Approving ${selectedRequests.length} request(s)...`)
    
    let successCount = 0
    for (const requestId of selectedRequests) {
      const result = await dispatch(approveRequest({ id: requestId, modifiedData: null }))
      if (result.meta.requestStatus === 'fulfilled') {
        successCount++
      }
    }
    
    if (successCount === selectedRequests.length) {
      success(`✅ Successfully approved ${successCount} request(s)!`)
    } else if (successCount > 0) {
      warning(`⚠️ Approved ${successCount} of ${selectedRequests.length} request(s)`)
    } else {
      error('❌ Failed to approve requests')
    }
    
    setSelectedRequests([])
    dispatch(fetchRequests({ status: 'SUBMITTED' }))
  }

  const handleDownloadPDF = (request) => {
    try {
      info('📄 Generating PDF...')
      generateRequestPDF(request)
      success(`✅ PDF downloaded for Request #${request.requestNumber}`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      warning(`⚠️ Failed to generate PDF: ${err.message || 'Unknown error'}`)
    }
  }

  const handleDownloadAllPDF = () => {
    try {
      if (filteredRequests.length === 0) {
        warning('⚠️ No requests to download')
        return
      }
      info(`📄 Generating PDF with ${filteredRequests.length} request(s)...`)
      generateMultipleRequestsPDF(filteredRequests)
      success(`✅ PDF downloaded with ${filteredRequests.length} request(s)`)
    } catch (err) {
      console.error('PDF generation failed:', err)
      warning(`⚠️ Failed to generate PDF: ${err.message || 'Unknown error'}`)
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    let filtered = requests.filter(request => {
      const matchesSearch = 
        request.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.lsrId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.route?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesPriority = filterPriority === 'ALL' || request.priority === filterPriority
      
      // Filter by type: INCOMING (today only) or ALL
      let matchesType = true
      if (filterType === 'INCOMING') {
        const today = new Date()
        const submittedDate = new Date(request.submittedAt || request.createdAt)
        matchesType = today.toDateString() === submittedDate.toDateString()
      }
      
      return matchesSearch && matchesPriority && matchesType
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (sortBy === 'submittedAt' || sortBy === 'createdAt') {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [requests, searchTerm, filterPriority, filterType, sortBy, sortOrder])

  // Calculate stats
  const stats = useMemo(() => {
    const totalItems = requests.reduce((sum, r) => 
      sum + r.commercialProducts.length + r.posmItems.length, 0
    )
    const avgItems = requests.length > 0 ? (totalItems / requests.length).toFixed(1) : 0
    
    return {
      pending: requests.length,
      uniqueLSRs: new Set(requests.map(r => r.lsrId)).size,
      avgItems,
      urgent: requests.filter(r => r.isUrgent || r.priority === 'URGENT').length
    }
  }, [requests])

  return (
    <DashboardLayout 
      userRole="LOGISTICS" 
      title="Pending Requests" 
      subtitle="Review and approve submitted load requests"
    >
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Quick Actions & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={handleDownloadAllPDF}
              disabled={filteredRequests.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm disabled:opacity-50"
              title="Download all requests as PDF"
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF ({filteredRequests.length})
            </button>
            <button
              onClick={handleExportToCSV}
              disabled={isExporting || !requests || requests.length === 0}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export all requests to CSV"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export to CSV'}
            </button>
            {selectedRequests.length > 0 && (
              <button
                onClick={handleBulkApprove}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve Selected ({selectedRequests.length})
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by request number, LSR ID, or route..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
          {(searchTerm || filterPriority !== 'ALL') && (
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredRequests.length} of {requests.length} requests</span>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterPriority('ALL')
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Indicator */}
      {filterType !== 'ALL' && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <div className="flex items-center">
            <Filter className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">
              Showing: {filterType === 'INCOMING' ? 'Incoming Requests (Today Only)' : 'All Pending Requests'}
            </span>
          </div>
          <button
            onClick={() => setFilterType('ALL')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Colorful Cards - Same as Main Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Incoming Requests Card */}
        <button
          onClick={() => setFilterType('INCOMING')}
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
              {stats.pending} {stats.pending === 1 ? 'Request' : 'Requests'}
            </div>
          </div>
        </button>

        {/* Pending Requests Card */}
        <button
          onClick={() => setFilterType('ALL')}
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
              {stats.pending} {stats.pending === 1 ? 'Request' : 'Requests'}
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
            <CheckCircle2 className="h-7 w-7 text-white" />
          </div>

          <div className="relative">
            <h3 className="text-xl font-bold text-green-700 mb-2 group-hover:text-opacity-90 transition-colors">
              Approved Requests
            </h3>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              View all approved requests
            </p>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm text-green-700">
              View All
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
            <FileText className="h-7 w-7 text-white" />
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

      {/* Requests Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Pending Requests ({filteredRequests.length})
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review and approve submitted load requests
              </p>
            </div>
            {filteredRequests.length > 0 && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedRequests.length === filteredRequests.length && filteredRequests.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">Select All</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 text-gray-400">
              {searchTerm || filterPriority !== 'ALL' ? (
                <Search className="h-16 w-16" />
              ) : (
                <CheckCircle2 className="h-16 w-16" />
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm || filterPriority !== 'ALL' ? 'No matching requests' : 'No pending requests'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterPriority !== 'ALL' 
                ? 'Try adjusting your search or filters' 
                : 'All requests have been processed.'}
            </p>
          </div>
        ) : (
          <>
          <ul className="divide-y divide-gray-200">
            {(() => {
              const indexOfLastItem = currentPage * itemsPerPage;
              const indexOfFirstItem = indexOfLastItem - itemsPerPage;
              const currentRequests = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
              return currentRequests.map((request) => (
              <li key={request.id} className={selectedRequests.includes(request.id) ? 'bg-blue-50' : ''}>
                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="flex items-center pt-1">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => toggleSelectRequest(request.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            SUBMITTED
                          </span>
                          {(request.priority === 'URGENT' || request.isUrgent) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              URGENT
                            </span>
                          )}
                          {request.priority && request.priority !== 'MEDIUM' && request.priority !== 'URGENT' && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              request.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {request.priority}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => toggleRequestExpand(request.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedRequests.has(request.id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-base font-semibold text-gray-900">
                            Request #{request.requestNumber}
                          </p>
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              LSR: {request.lsrId}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {formatDate(request.submittedAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <p className="text-sm font-medium text-gray-900">
                              {request.commercialProducts.length + request.posmItems.length} Items
                            </p>
                            <p className="text-xs text-gray-500">
                              {request.commercialProducts.length} Products, {request.posmItems.length} POSM
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleViewDetails(request)}
                              className="p-2 text-blue-600 hover:text-blue-800 rounded-md hover:bg-blue-50 transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(request)}
                              className="p-2 text-purple-600 hover:text-purple-800 rounded-md hover:bg-purple-50 transition-colors"
                              title="Download PDF"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="p-2 text-green-600 hover:text-green-800 rounded-md hover:bg-green-50 transition-colors"
                              title="Approve"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => openRejectModal(request.id)}
                              className="p-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50 transition-colors"
                              title="Reject"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                  
                      {/* Expandable Details */}
                      {expandedRequests.has(request.id) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                          {request.route && (
                            <div className="flex items-start">
                              <span className="text-sm font-medium text-gray-700 w-24">Route:</span>
                              <span className="text-sm text-gray-600">{request.route}</span>
                            </div>
                          )}
                          
                          {request.notes && (
                            <div className="flex items-start">
                              <span className="text-sm font-medium text-gray-700 w-24">Notes:</span>
                              <span className="text-sm text-gray-600">{request.notes}</span>
                            </div>
                          )}

                          {/* Commercial Products */}
                          {request.commercialProducts.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                Commercial Products ({request.commercialProducts.length})
                              </p>
                              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                                {request.commercialProducts.map((product, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-900 font-medium">{product.name}</span>
                                    <span className="text-gray-600">
                                      {product.sku} • {product.qty} {product.uom}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* POSM Items */}
                          {request.posmItems.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                POSM Items ({request.posmItems.length})
                              </p>
                              <div className="bg-gray-50 rounded-md p-3 space-y-2">
                                {request.posmItems.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-900 font-medium">{item.description}</span>
                                    <span className="text-gray-600">
                                      {item.code} • {item.qty} units
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  Reject Request
                </h3>
                <button onClick={closeRejectModal} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for rejection (required)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a detailed reason for rejection..."
                  autoFocus
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeRejectModal}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Request Details #{selectedRequest.requestNumber}
              </h3>
              <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Request Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Request Number</p>
                    <p className="text-base font-semibold text-gray-900">{selectedRequest.requestNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">LSR ID</p>
                    <p className="text-base text-gray-900">{selectedRequest.lsrId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submitted At</p>
                    <p className="text-base text-gray-900">{formatDate(selectedRequest.submittedAt)}</p>
                  </div>
                  {selectedRequest.route && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Route</p>
                      <p className="text-base text-gray-900">{selectedRequest.route}</p>
                    </div>
                  )}
                  {selectedRequest.priority && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">Priority</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedRequest.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                        selectedRequest.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedRequest.priority}
                      </span>
                    </div>
                  )}
                </div>
                {selectedRequest.notes && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-900 bg-white p-3 rounded border border-gray-200">
                      {selectedRequest.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Commercial Products */}
              {(editMode ? editedProducts : selectedRequest.commercialProducts).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-between">
                    <span className="flex items-center">
                      <Package className="h-5 w-5 mr-2 text-blue-600" />
                      Commercial Products ({(editMode ? editedProducts : selectedRequest.commercialProducts).length})
                    </span>
                    {!editMode && (
                      <button
                        onClick={handleEditQuantity}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit Quantities
                      </button>
                    )}
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Price</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(editMode ? editedProducts : selectedRequest.commercialProducts).map((product, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{product.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.uom}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {editMode ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={product.qty}
                                  onChange={(e) => updateProductQuantity(index, e.target.value)}
                                  className="w-20 px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right font-medium"
                                />
                              ) : (
                                <span className="font-medium">{product.qty}</span>
                              )}
                            </td>
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
                            ₹{(editMode ? editedProducts : selectedRequest.commercialProducts)
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
              {(editMode ? editedPosm : selectedRequest.posmItems).length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-purple-600" />
                    POSM Items ({(editMode ? editedPosm : selectedRequest.posmItems).length})
                  </h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(editMode ? editedPosm : selectedRequest.posmItems).map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.description}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.code}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">
                              {editMode ? (
                                <input
                                  type="number"
                                  min="0"
                                  value={item.qty}
                                  onChange={(e) => updatePosmQuantity(index, e.target.value)}
                                  className="w-20 px-2 py-1 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right font-medium"
                                />
                              ) : (
                                <span className="font-medium">{item.qty}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Actions */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between items-center gap-3">
              {editMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 flex items-center">
                  <AlertCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800 font-medium">Editing quantities - Save or Cancel changes</span>
                </div>
              )}
              <div className="flex gap-3 ml-auto">
                {editMode ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveQuantities}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 flex items-center"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={closeDetailsModal}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(selectedRequest)}
                      className="px-4 py-2 border border-purple-600 text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 flex items-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => {
                        closeDetailsModal()
                        openRejectModal(selectedRequest.id)
                      }}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 flex items-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedRequest.id, selectedRequest)
                        closeDetailsModal()
                      }}
                      className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 flex items-center"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </DashboardLayout>
  )
}

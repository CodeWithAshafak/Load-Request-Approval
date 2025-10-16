import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import DashboardLayout from '../components/DashboardLayout'
import { Plus, Clock, CheckCircle, History, ChevronLeft, X, ShoppingCart, Package, Calendar, ChevronRight, Download } from 'lucide-react'
import { fetchRecommendedLoad, fetchRequests } from '../store/slices/loadRequestSlice'
import axios from 'axios'
import BASE_URL from '../config'

export default function LsrDashboardNew() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { requests, recommendedLoad, loading } = useSelector((state) => state.loadRequest)
  const [isExporting, setIsExporting] = useState(false)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('commercial')
  const [deliveryDate, setDeliveryDate] = useState('Today')
  const [commercialItems, setCommercialItems] = useState([])
  const [posmItems, setPosmItems] = useState([])
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    uom: 'PCS',
    recommended: 0,
    preOrder: 0,
    buffer: 0
  })

  // Fetch user's requests for export
  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchRequests({ lsrId: user.userId }))
    }
  }, [user, dispatch])

  // Clear items when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      // Clear all items when modal is closed
      setCommercialItems([])
      setPosmItems([])
    }
  }, [isModalOpen])

  // Export to CSV function
  const handleExportToCSV = () => {
    setIsExporting(true)
    
    try {
      // Prepare CSV data
      const csvRows = []
      
      // Add headers
      csvRows.push(['Request Number', 'Status', 'Route', 'Created Date', 'Submitted Date', 'Decided Date', 'Priority', 'Total Items', 'Total Value', 'Notes'].join(','))
      
      // Add data rows
      requests.forEach(request => {
        const row = [
          request.requestNumber || '',
          request.status || '',
          request.route || '',
          request.createdAt ? new Date(request.createdAt).toLocaleDateString() : '',
          request.submittedAt ? new Date(request.submittedAt).toLocaleDateString() : '',
          request.decidedAt ? new Date(request.decidedAt).toLocaleDateString() : '',
          request.priority || '',
          (request.commercialProducts?.length || 0) + (request.posmItems?.length || 0),
          request.totalValue || 0,
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
      link.setAttribute('download', `LSR_Requests_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ CSV exported successfully')
    } catch (error) {
      console.error('❌ Error exporting CSV:', error)
      alert('Failed to export CSV. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleAddProduct = () => {
    if (newProduct.sku && newProduct.name) {
      const total = parseInt(newProduct.recommended) + parseInt(newProduct.preOrder) + parseInt(newProduct.buffer)
      const product = {
        id: commercialItems.length + 1,
        sku: newProduct.sku,
        name: newProduct.name,
        uom: newProduct.uom,
        recommended: parseInt(newProduct.recommended) || 0,
        preOrder: parseInt(newProduct.preOrder) || 0,
        buffer: parseInt(newProduct.buffer) || 0,
        total: total
      }
      setCommercialItems([...commercialItems, product])
      setShowAddProductModal(false)
      setNewProduct({
        sku: '',
        name: '',
        uom: 'PCS',
        recommended: 0,
        preOrder: 0,
        buffer: 0
      })
    }
  }

  const calculateTotals = () => {
    const totalItems = commercialItems.length
    const totalRecommended = commercialItems.reduce((sum, item) => sum + item.recommended, 0)
    const totalPreOrders = commercialItems.reduce((sum, item) => sum + item.preOrder, 0)
    const totalQuantity = commercialItems.reduce((sum, item) => sum + item.total, 0)
    return { totalItems, totalRecommended, totalPreOrders, totalQuantity }
  }

  const totals = calculateTotals()

  const cards = [
    {
      id: 1,
      icon: Plus,
      title: 'Create New Request',
      description: 'Submit a new load service request for vehicle scheduling and route assignment',
      buttonText: 'Create Request',
      buttonAction: () => navigate('/lsr/load-request'),
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      icon: Clock,
      title: 'Pending Requests',
      description: 'View and track load service requests that are pending approval or processing',
      buttonText: 'View Pending',
      buttonAction: () => navigate('/lsr/pending'),
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600'
    },
    {
      id: 3,
      icon: CheckCircle,
      title: 'Approved Requests',
      description: 'Browse approved load service requests and their execution details',
      buttonText: 'View Approved',
      buttonAction: () => navigate('/lsr/approved'),
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      id: 4,
      icon: History,
      title: 'Request History',
      description: 'View complete history of all your load service requests with detailed status',
      buttonText: 'View History',
      buttonAction: () => navigate('/lsr/history'),
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600'
    }
  ]

  return (
    <DashboardLayout 
      userRole="LSR" 
      title="LSR - Van Sales Rep Portal" 
      subtitle="Initiate daily load requests, review system recommendations, and adjust buffer"
    >
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/load-management')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Load Management
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LSR - Van Sales Rep Portal</h1>
          <p className="text-gray-600">Initiate daily load requests, review system recommendations, and adjust buffer</p>
        </div>
        <button
          onClick={handleExportToCSV}
          disabled={isExporting || !requests || requests.length === 0}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export to CSV'}
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const IconComponent = card.icon
          const gradientColors = {
            1: { from: 'from-blue-50', to: 'to-blue-100', border: 'border-blue-200', iconFrom: 'from-blue-500', iconTo: 'to-blue-600', text: 'text-blue-700', badge: 'text-blue-700' },
            2: { from: 'from-yellow-50', to: 'to-yellow-100', border: 'border-yellow-200', iconFrom: 'from-yellow-500', iconTo: 'to-yellow-600', text: 'text-yellow-700', badge: 'text-yellow-700' },
            3: { from: 'from-green-50', to: 'to-green-100', border: 'border-green-200', iconFrom: 'from-green-500', iconTo: 'to-green-600', text: 'text-green-700', badge: 'text-green-700' },
            4: { from: 'from-purple-50', to: 'to-purple-100', border: 'border-purple-200', iconFrom: 'from-purple-500', iconTo: 'to-purple-600', text: 'text-purple-700', badge: 'text-purple-700' }
          }
          const colors = gradientColors[card.id]
          
          return (
            <button
              key={card.id}
              onClick={card.buttonAction}
              className={`group relative bg-gradient-to-br ${colors.from} ${colors.to} border-2 ${colors.border} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 text-left overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              
              <div className={`relative mb-4 w-14 h-14 bg-gradient-to-br ${colors.iconFrom} ${colors.iconTo} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <IconComponent className="h-7 w-7 text-white" />
              </div>

              <div className="relative">
                <h3 className={`text-xl font-bold ${colors.text} mb-2 group-hover:text-opacity-90 transition-colors`}>
                  {card.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {card.description}
                </p>
                
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-white shadow-sm ${colors.badge}`}>
                  {card.buttonText}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Create Load Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <ChevronLeft className="h-5 w-5 text-gray-600 mr-2" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Load Request Management</h2>
                  <p className="text-sm text-gray-500">Create and manage your load requests efficiently</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Load Request Grid Header */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900">Load Request Grid</h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Items:</span>
                      <span className="ml-1 font-bold text-gray-900">{totals.totalItems}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Total Qty:</span>
                      <span className="ml-1 font-bold text-gray-900">{totals.totalQuantity}</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Manage your product inventory and orders</p>

                {/* Delivery Date */}
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 mr-2">Planned Delivery Date:</label>
                      <select
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option>Today</option>
                        <option>Tomorrow</option>
                        <option>Custom</option>
                      </select>
                    </div>
                    <span className="text-sm text-gray-600">Delivery: September 30th, 2025</span>
                  </div>
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200">
                    ⚡ Planned Today
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mb-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('commercial')}
                  className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === 'commercial'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Commercial Items
                </button>
                <button
                  onClick={() => setActiveTab('posm')}
                  className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors duration-200 ${
                    activeTab === 'posm'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package className="h-4 w-4 mr-2" />
                  POSM
                </button>
              </div>

              {/* Commercial Items Table */}
              {activeTab === 'commercial' && (
                loading ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                    <p className="text-sm text-gray-600">Loading recommended products...</p>
                  </div>
                ) : commercialItems.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Commercial Items</h3>
                    <p className="text-sm text-gray-600 mb-4">Add commercial products to your load request</p>
                    <button 
                      onClick={() => setShowAddProductModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 inline mr-2" />
                      Add Commercial Item
                    </button>
                  </div>
                ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UOM</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">📊 Recommended</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">📋 Pre-Order</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">+ Buffer Adj.</th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">🎯 Total Qty</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {commercialItems.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.uom}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-900">{item.recommended}</span>
                                <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-900">{item.preOrder}</span>
                                <ChevronRight className="h-4 w-4 text-gray-400 ml-1" />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <input
                                type="number"
                                value={item.buffer}
                                onChange={(e) => {
                                  const newItems = commercialItems.map(i => 
                                    i.id === item.id ? { ...i, buffer: parseInt(e.target.value) || 0 } : i
                                  )
                                  setCommercialItems(newItems)
                                }}
                                className="w-16 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="inline-flex items-center px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full">
                                {item.total} {item.uom}
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary Footer */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-6">
                        <span className="text-gray-600">Total Items: <span className="font-bold text-gray-900">{totals.totalItems}</span></span>
                        <span className="text-gray-600">Recommended: <span className="font-bold text-gray-900">{totals.totalRecommended}</span></span>
                        <span className="text-gray-600">Pre-Orders: <span className="font-bold text-gray-900">{totals.totalPreOrders}</span></span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">🎯 Total Quantity:</span>
                        <span className="text-lg font-bold text-gray-900">{totals.totalQuantity}</span>
                      </div>
                    </div>
                  </div>
                </div>
                )
              )}

              {/* POSM Items Table */}
              {activeTab === 'posm' && (
                <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No POSM Items</h3>
                  <p className="text-sm text-gray-600 mb-4">Add POSM items to your load request</p>
                  <button className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200">
                    Next: POSM Items
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-between">
                <button 
                  onClick={() => setShowAddProductModal(true)}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Commercial Item
                </button>
                <button className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors duration-200">
                  Next: POSM Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Add Commercial Item</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                <input
                  type="text"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter SKU"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">UOM</label>
                <select
                  value={newProduct.uom}
                  onChange={(e) => setNewProduct({ ...newProduct, uom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PCS">PCS</option>
                  <option value="CASE">CASE</option>
                  <option value="UNIT">UNIT</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommended</label>
                  <input
                    type="number"
                    value={newProduct.recommended}
                    onChange={(e) => setNewProduct({ ...newProduct, recommended: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pre-Order</label>
                  <input
                    type="number"
                    value={newProduct.preOrder}
                    onChange={(e) => setNewProduct({ ...newProduct, preOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Buffer</label>
                  <input
                    type="number"
                    value={newProduct.buffer}
                    onChange={(e) => setNewProduct({ ...newProduct, buffer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAddProductModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProduct}
                disabled={!newProduct.sku || !newProduct.name}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

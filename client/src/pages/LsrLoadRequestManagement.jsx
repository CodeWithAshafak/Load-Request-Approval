import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import DashboardLayout from '../components/DashboardLayout'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { Plus, ChevronLeft, X, ShoppingCart, Package, ChevronRight, Search, Trash2 } from 'lucide-react'
import { fetchRecommendedLoad, fetchProducts, fetchPosmItems } from '../store/slices/loadRequestSlice'
import axios from 'axios'
import BASE_URL from '../config'

export default function LsrLoadRequestManagement() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { recommendedLoad, loading } = useSelector((state) => state.loadRequest)
  const { toasts, removeToast, success, error: showError, warning, info } = useToast()
  
  const [activeTab, setActiveTab] = useState('commercial')
  const [deliveryDate, setDeliveryDate] = useState('Today')
  const [route, setRoute] = useState('')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [routes, setRoutes] = useState([])
  const [loadingRoutes, setLoadingRoutes] = useState(false)
  const [commercialItems, setCommercialItems] = useState([])
  const [posmItems, setPosmItems] = useState([])
  const [hasManuallyAddedItems, setHasManuallyAddedItems] = useState(false) // Track if user has manually added items
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [modalType, setModalType] = useState('') // 'commercial' or 'posm'
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch recommended load when component mounts (only if user hasn't manually added items)
  useEffect(() => {
    if (user?.userId && !hasManuallyAddedItems) {
      dispatch(fetchRecommendedLoad(user.userId))
    }
  }, [user, dispatch, hasManuallyAddedItems])

  // Fetch routes when component mounts
  useEffect(() => {
    const fetchRoutes = async () => {
      setLoadingRoutes(true)
      try {
        const response = await axios.get(`${BASE_URL}/routes`)
        console.log('✅ Routes fetched:', response.data)
        setRoutes(response.data)
      } catch (error) {
        console.error('❌ Error fetching routes:', error)
        warning('Could not load routes from server. Using default routes.')
        // Fallback to default Indian routes if API fails
        setRoutes([
          { id: 1, name: 'Mumbai Central Route', code: 'MUM-C-01' },
          { id: 2, name: 'Delhi NCR Route', code: 'DEL-NCR-01' },
          { id: 3, name: 'Bangalore East Route', code: 'BLR-E-01' },
          { id: 4, name: 'Pune West Route', code: 'PUN-W-01' },
          { id: 5, name: 'Hyderabad South Route', code: 'HYD-S-01' },
          { id: 6, name: 'Chennai North Route', code: 'CHN-N-01' },
          { id: 7, name: 'Kolkata Metro Route', code: 'KOL-M-01' },
          { id: 8, name: 'Ahmedabad City Route', code: 'AMD-C-01' }
        ])
      } finally {
        setLoadingRoutes(false)
      }
    }
    fetchRoutes()
  }, [])

  // Update commercial items when recommended load is fetched (only if user hasn't manually added items)
  useEffect(() => {
    if (!hasManuallyAddedItems) {
      if (recommendedLoad?.commercialProducts && recommendedLoad.commercialProducts.length > 0) {
        console.log('📦 Backend recommended data:', recommendedLoad.commercialProducts)
        const items = recommendedLoad.commercialProducts.map((product, index) => ({
          id: index + 1,
          sku: product.sku || '',
          name: product.name || '',
          uom: product.uom || 'PCS',
          recommended: product.recommendedQty || 0, // For display only
          preOrder: product.preOrderQty || 0,
          buffer: product.bufferQty || 0,
          total: (product.preOrderQty || 0) + (product.bufferQty || 0), // Only preOrder + buffer
          isRecommended: true // Mark as recommended item
        }))
        setCommercialItems(items)
      }
      if (recommendedLoad?.posmItems && recommendedLoad.posmItems.length > 0) {
        const items = recommendedLoad.posmItems.map((item, index) => ({
          id: index + 1,
          code: item.code || '',
          description: item.description || '',
          qty: item.qty || 0,
          isRecommended: true // Mark as recommended item
        }))
        setPosmItems(items)
      }
    }
  }, [recommendedLoad, hasManuallyAddedItems])

  const handleOpenModal = (type) => {
    setModalType(type)
    setShowAddProductModal(true)
    setSearchQuery('')
    setSearchResults([])
    setSelectedProducts([])
  }

  const handleCloseModal = () => {
    setShowAddProductModal(false)
    setModalType('')
    setSearchQuery('')
    setSearchResults([])
    setSelectedProducts([])
  }

  const handleCloseSubmitModal = () => {
    setShowSubmitModal(false)
    // Reset form fields when closing
    setRoute('')
    setExpectedDeliveryDate('')
    setNotes('')
    setPriority('MEDIUM')
  }

  const handleSearch = useCallback(async (query) => {
    const searchTerm = query || searchQuery
    
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    console.log('🔍 Searching for:', searchTerm, 'Type:', modalType)
    
    try {
      let response
      if (modalType === 'commercial') {
        // Search for commercial products
        const url = `${BASE_URL}/products/search?query=${encodeURIComponent(searchTerm)}`
        console.log('📡 Fetching from:', url)
        response = await axios.get(url)
        console.log('✅ Products response:', response.data)
        
        console.log('📊 Product data with avgSales:', response.data)
        setSearchResults(response.data.map(product => ({
          ...product,
          orderQty: 0,
          amount: 0
        })))
      } else {
        // Search for POSM items
        const url = `${BASE_URL}/posm/search?query=${encodeURIComponent(searchTerm)}`
        console.log('📡 Fetching from:', url)
        response = await axios.get(url)
        console.log('✅ POSM response:', response.data)
        
        setSearchResults(response.data.map(item => ({
          ...item,
          orderQty: 0
        })))
      }
    } catch (error) {
      console.error('❌ Search error:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, modalType])

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery)
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [searchQuery, modalType, handleSearch])

  const handleAddToSelected = (product) => {
    const identifier = product.sku || product.code
    
    // Check if quantity is zero or negative
    if (!product.orderQty || product.orderQty <= 0) {
      showError(`Please enter a valid quantity greater than 0 for ${product.name || product.description}`)
      return
    }
    
    const existingProduct = selectedProducts.find(p => (p.sku || p.code) === identifier)
    
    if (existingProduct) {
      warning(`${product.name || product.description} is already added to the selection`)
      return
    }
    
    console.log('Adding to selected:', product)
    setSelectedProducts([...selectedProducts, { ...product }])
    
    // Remove the product from search results after adding
    setSearchResults(searchResults.filter(item => (item.sku || item.code) !== identifier))
  }

  const handleRemoveFromSelected = (productId) => {
    // Find the product being removed
    const removedProduct = selectedProducts.find(p => (p.sku || p.code) === productId)
    
    // Remove from selected products
    setSelectedProducts(selectedProducts.filter(p => (p.sku || p.code) !== productId))
    
    // Add back to search results if it was removed
    if (removedProduct) {
      setSearchResults([...searchResults, removedProduct])
    }
  }

  const handleUpdateOrderQty = (productId, qty) => {
    setSelectedProducts(selectedProducts.map(p => {
      if ((p.sku || p.code) === productId) {
        const newQty = parseInt(qty) || 0
        return {
          ...p,
          orderQty: newQty,
          amount: modalType === 'commercial' ? p.mrp * newQty : newQty
        }
      }
      return p
    }))
  }

  const handleAddToLoadRequest = () => {
    // Mark that user has manually added items - this will clear recommended items
    setHasManuallyAddedItems(true)
    
    if (modalType === 'commercial') {
      // Get SKUs of selected products
      const selectedSkus = selectedProducts.map(p => p.sku)
      
      // Remove ALL recommended items and keep only manually added items that aren't duplicates
      const manuallyAddedItems = commercialItems.filter(item => !item.isRecommended && !selectedSkus.includes(item.sku))
      
      // Create new items from selected products
      const newItems = selectedProducts.map((product, index) => {
        const recommendedQty = product.avgSales || 0; // Use avgSales from backend (for display only)
        const preOrderQty = Math.ceil(recommendedQty * 0.15); // 15% of recommended
        const bufferQty = Math.ceil(recommendedQty * 0.10); // 10% of recommended
        const orderQty = product.orderQty || 0;
        
        return {
          id: manuallyAddedItems.length + index + 1,
          sku: product.sku,
          name: product.name,
          uom: 'PCS',
          recommended: recommendedQty, // For display only, not included in total
          preOrder: preOrderQty,
          buffer: bufferQty,
          total: preOrderQty + bufferQty, // Only preOrder + buffer
          mrp: product.mrp || 0,
          amount: (product.mrp || 0) * (preOrderQty + bufferQty),
          isRecommended: false // Mark as manually added
        };
      })
      
      // Replace all items with only manually added items
      setCommercialItems([...manuallyAddedItems, ...newItems])
      success(`${selectedProducts.length} commercial product(s) added to load request`)
    } else {
      // Get codes of selected POSM items
      const selectedCodes = selectedProducts.map(p => p.code)
      
      // Remove ALL recommended items and keep only manually added items that aren't duplicates
      const manuallyAddedItems = posmItems.filter(item => !item.isRecommended && !selectedCodes.includes(item.code))
      
      // Create new items from selected products
      const newItems = selectedProducts.map((item, index) => ({
        id: manuallyAddedItems.length + index + 1,
        code: item.code,
        description: item.description,
        qty: item.orderQty || 0,
        isRecommended: false // Mark as manually added
      }))
      
      // Replace all items with only manually added items
      setPosmItems([...manuallyAddedItems, ...newItems])
      success(`${selectedProducts.length} POSM item(s) added to load request`)
    }
    handleCloseModal()
  }

  const handleRemoveItem = (id, type) => {
    if (type === 'commercial') {
      const item = commercialItems.find(i => i.id === id)
      setCommercialItems(commercialItems.filter(item => item.id !== id))
      info(`Removed ${item?.name || 'product'} from load request`)
    } else {
      const item = posmItems.find(i => i.id === id)
      setPosmItems(posmItems.filter(item => item.id !== id))
      info(`Removed ${item?.description || 'POSM item'} from load request`)
    }
  }

  const handleSubmitRequest = async () => {
    // Validation
    if (!route) {
      showError('Please select a route')
      return
    }
    if (!expectedDeliveryDate) {
      showError('Please select an expected delivery date')
      return
    }

    setIsSubmitting(true)
    info('Creating load request...')

    try {
      // Prepare the request data
      const requestData = {
        userId: user.userId,
        route: route,
        expectedDeliveryDate: expectedDeliveryDate,
        priority: priority,
        notes: notes,
        commercialProducts: commercialItems.map(item => ({
          id: item.id,
          sku: item.sku,
          name: item.name,
          uom: item.uom === 'PCS' ? 'UNIT' : (item.uom || 'CASE'), // Convert PCS to UNIT
          qty: item.total, // Use total as qty
          unitPrice: item.mrp || 0,
          totalValue: item.amount || 0
        })),
        posmItems: posmItems.map(item => ({
          id: item.id,
          code: item.code,
          description: item.description,
          qty: item.qty
        }))
      }

      console.log('📤 Submitting load request:', requestData)
      
      // Step 1: Create the request (as DRAFT)
      const createResponse = await axios.post(`${BASE_URL}/requests`, requestData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      console.log('✅ Request created:', createResponse.data)
      
      // Step 2: Submit the request (change status to SUBMITTED)
      const submitResponse = await axios.post(
        `${BASE_URL}/requests/${createResponse.data.id}/submit`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      
      console.log('✅ Request submitted successfully:', submitResponse.data)
      
      success('Load request created and submitted successfully!')
      setIsSubmitting(false)
      handleCloseSubmitModal()
      
      // Clear the form
      setCommercialItems([])
      setPosmItems([])
      
      // Navigate back to dashboard
      setTimeout(() => {
        navigate('/lsr')
      }, 1500)
    } catch (error) {
      console.error('❌ Error submitting load request:', error)
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
      
      // Show specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create load request. Please try again.'
      showError(errorMessage)
      setIsSubmitting(false)
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

  return (
    <DashboardLayout 
      userRole="LSR" 
      title="Load Request Management" 
      subtitle="Create and manage your load requests efficiently"
    >
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/lsr')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to LSR
        </button>
      </div>

      {/* Page Header with Action Buttons */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Load Requests</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleOpenModal('commercial')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Commercial Products
          </button>
          <button
            onClick={() => handleOpenModal('posm')}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add POSM Items
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-4 bg-white border-b border-gray-200">
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
        commercialItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Commercial Products Added</h3>
            <p className="text-sm text-gray-500 mb-4">Click the button above to search and add commercial products to your load request</p>
          </div>
        ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Recommended</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Pre-Ordered</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Buffer Adj</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {commercialItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{item.recommended}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">{item.preOrder}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="number"
                        value={item.buffer}
                        onChange={(e) => {
                          const newItems = commercialItems.map(i => 
                            i.id === item.id ? { ...i, buffer: parseInt(e.target.value) || 0, total: i.recommended + i.preOrder + (parseInt(e.target.value) || 0) } : i
                          )
                          setCommercialItems(newItems)
                        }}
                        className="w-20 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">{item.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id, 'commercial')}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )
      )}

      {/* POSM Items Table */}
      {activeTab === 'posm' && (
        posmItems.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No POSM Items Added</h3>
            <p className="text-sm text-gray-500 mb-4">Click the button above to search and add POSM items to your load request</p>
          </div>
        ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posmItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => {
                          const newItems = posmItems.map(i => 
                            i.id === item.id ? { ...i, qty: parseInt(e.target.value) || 0 } : i
                          )
                          setPosmItems(newItems)
                        }}
                        className="w-20 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id, 'posm')}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )
      )}

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button 
          onClick={() => setShowSubmitModal(true)}
          disabled={commercialItems.length === 0 && posmItems.length === 0}
          className="px-8 py-3 bg-green-600 text-white text-base font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Commercial Products Request
        </button>
      </div>

      {/* Add Products/POSM Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                {modalType === 'commercial' ? 'Add Commercial Products' : 'Add POSM Items'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Start typing to search ${modalType === 'commercial' ? 'products' : 'POSM items'} by name or ${modalType === 'commercial' ? 'SKU' : 'code'}...`}
                  autoFocus
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-blue-200 border-t-blue-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results Table */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {isSearching ? (
                <div className="flex items-center justify-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                  <span className="ml-3 text-gray-600">Searching...</span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU/CODE</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          {modalType === 'commercial' ? 'Product Name' : 'Description'}
                        </th>
                        {modalType === 'commercial' && (
                          <>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">MRP</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Stock</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Reserved</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Available</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Avg Sales/Day</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Order Qty</th>
                        {modalType === 'commercial' && (
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Amount</th>
                        )}
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {searchResults.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{item.sku || item.code}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.name || item.description}</td>
                          {modalType === 'commercial' && (
                            <>
                              <td className="px-4 py-3 text-center text-sm text-gray-900">₹{item.mrp}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-900">{item.stock}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-900">{item.reserved}</td>
                              <td className="px-4 py-3 text-center text-sm text-green-600 font-medium">{item.available}</td>
                              <td className="px-4 py-3 text-center text-sm text-gray-900">{item.avgSales}</td>
                            </>
                          )}
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              value={item.orderQty}
                              onChange={(e) => {
                                const newResults = [...searchResults]
                                newResults[index].orderQty = parseInt(e.target.value) || 0
                                if (modalType === 'commercial') {
                                  newResults[index].amount = item.mrp * (parseInt(e.target.value) || 0)
                                }
                                setSearchResults(newResults)
                              }}
                              className="w-20 px-2 py-1 text-center border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </td>
                          {modalType === 'commercial' && (
                            <td className="px-4 py-3 text-center text-sm font-medium text-gray-900">
                              ₹{item.amount?.toFixed(2) || '0.00'}
                            </td>
                          )}
                          <td className="px-4 py-3 text-center">
                            {selectedProducts.find(p => (p.sku || p.code) === (item.sku || item.code)) ? (
                              <span className="text-green-600 text-sm font-medium">✓ Added</span>
                            ) : (
                              <button
                                onClick={() => handleAddToSelected(item)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                              >
                                Add
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? 'No results found. Try a different search term.' : 'Start typing in the search box above to find items.'}
                </div>
              )}

              {/* Selected Products */}
              {selectedProducts.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">Selected Items ({selectedProducts.length})</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU/CODE</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedProducts.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.sku || item.code}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.name || item.description}</td>
                            <td className="px-4 py-2 text-center text-sm text-gray-900">{item.orderQty}</td>
                            <td className="px-4 py-2 text-center">
                              <button
                                onClick={() => handleRemoveFromSelected(item.sku || item.code)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={handleAddToLoadRequest}
                disabled={selectedProducts.length === 0}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Load Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Confirm Load Request</h3>
              <button
                onClick={handleCloseSubmitModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                {/* Route Selection */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Route <span className="text-red-500">*</span></h4>
                  {loadingRoutes ? (
                    <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-blue-200 border-t-blue-600 mr-2"></div>
                      <span className="text-sm text-gray-600">Loading routes...</span>
                    </div>
                  ) : (
                    <select
                      value={route}
                      onChange={(e) => setRoute(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a route</option>
                      {routes.map((r) => (
                        <option key={r.id} value={r.code || r.name}>
                          {r.name} {r.code ? `(${r.code})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Expected Delivery Date */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Expected Delivery Date <span className="text-red-500">*</span></h4>
                  <input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Priority */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Priority <span className="text-red-500">*</span></h4>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</h4>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Add any special instructions or notes..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {commercialItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Commercial Products ({commercialItems.length})</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">SKU</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Product</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Total Qty</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {commercialItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.sku}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                              <td className="px-4 py-2 text-center text-sm font-medium text-gray-900">{item.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {posmItems.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">POSM Items ({posmItems.length})</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Code</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {posmItems.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.code}</td>
                              <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                              <td className="px-4 py-2 text-center text-sm font-medium text-gray-900">{item.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div className="border-t-2 border-gray-300 pt-4 mt-4">
                  <h4 className="text-base font-bold text-gray-900 mb-3">Order Summary</h4>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total Commercial Products:</span>
                      <span className="text-sm font-semibold text-gray-900">{commercialItems.length} items</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total Product Quantity:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {commercialItems.reduce((sum, item) => sum + item.total, 0)} units
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Commercial Products Amount:</span>
                      <span className="text-sm font-semibold text-green-600">
                        ₹{commercialItems.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total POSM Items:</span>
                      <span className="text-sm font-semibold text-gray-900">{posmItems.length} items</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Total POSM Quantity:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {posmItems.reduce((sum, item) => sum + item.qty, 0)} units
                      </span>
                    </div>
                    <div className="border-t-2 border-gray-400 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Grand Total Items:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {commercialItems.length + posmItems.length} items
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-base font-bold text-gray-900">Grand Total Quantity:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {commercialItems.reduce((sum, item) => sum + item.total, 0) + 
                           posmItems.reduce((sum, item) => sum + item.qty, 0)} units
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 bg-green-100 -mx-4 px-4 py-2 rounded">
                        <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                        <span className="text-2xl font-bold text-green-700">
                          ₹{commercialItems.reduce((sum, item) => sum + (item.amount || 0), 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseSubmitModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Confirm & Submit'
                )}
              </button>
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
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </DashboardLayout>
  )
}

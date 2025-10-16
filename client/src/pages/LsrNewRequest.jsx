import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { createRequest, updateRequest, submitRequest, fetchProducts, fetchPosmItems } from '../store/slices/loadRequestSlice'
import DashboardLayout from '../components/DashboardLayout'
import Toast from '../components/Toast'
import { useToast } from '../hooks/useToast'
import { Plus, Minus, Save, Send } from 'lucide-react'

export default function LsrNewRequest() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { products, posmItems, loading, error } = useSelector((state) => state.loadRequest)

  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    route: '',
    notes: '',
    priority: 'MEDIUM',
    commercialProducts: [],
    posmItems: []
  })
  const { toasts, removeToast, success, error: showError, warning, info } = useToast()

  useEffect(() => {
    dispatch(fetchProducts())
    dispatch(fetchPosmItems())
  }, [dispatch])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addCommercialProduct = () => {
    const newProduct = {
      id: `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sku: '',
      name: '',
      uom: 'CASE',
      qty: 0
    }
    setFormData(prev => ({
      ...prev,
      commercialProducts: [...prev.commercialProducts, newProduct]
    }))
  }

  const updateCommercialProduct = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      commercialProducts: prev.commercialProducts.map((product, i) => 
        i === index ? { ...product, [field]: value } : product
      )
    }))
  }

  const removeCommercialProduct = (index) => {
    setFormData(prev => ({
      ...prev,
      commercialProducts: prev.commercialProducts.filter((_, i) => i !== index)
    }))
  }

  const addPosmItem = () => {
    const newPosmItem = {
      id: `posm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      code: '',
      description: '',
      qty: 0
    }
    setFormData(prev => ({
      ...prev,
      posmItems: [...prev.posmItems, newPosmItem]
    }))
  }

  const updatePosmItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      posmItems: prev.posmItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const removePosmItem = (index) => {
    setFormData(prev => ({
      ...prev,
      posmItems: prev.posmItems.filter((_, i) => i !== index)
    }))
  }

  const handleSaveDraft = async () => {
    try {
      const result = await dispatch(createRequest(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        success(`💾 Draft saved successfully! Request #${result.payload.requestNumber}`)
        setTimeout(() => navigate('/lsr'), 2000)
      } else {
        showError(result.payload || '❌ Failed to save draft')
      }
    } catch (err) {
      console.error('Save failed:', err)
      showError('❌ Failed to save draft. Please try again.')
    }
  }

  const handleSubmit = async () => {
    try {
      const result = await dispatch(createRequest(formData))
      if (result.meta.requestStatus === 'fulfilled') {
        // Submit the request
        const submitResult = await dispatch(submitRequest(result.payload.id))
        if (submitResult.meta.requestStatus === 'fulfilled') {
          success(`✅ Request #${submitResult.payload.requestNumber} submitted successfully! The logistics team will review it shortly.`)
          setTimeout(() => navigate('/lsr'), 3000)
        } else {
          showError(submitResult.payload || '❌ Failed to submit request')
        }
      } else {
        showError(result.payload || '❌ Failed to create request')
      }
    } catch (err) {
      console.error('Submit failed:', err)
      showError('❌ Failed to submit request. Please try again.')
    }
  }

  const canProceed = () => {
    if (step === 1) return formData.route.trim() !== ''
    if (step === 2) return formData.commercialProducts.length > 0 || formData.posmItems.length > 0
    return true
  }

  return (
    <DashboardLayout
      userRole="LSR"
      title="New Load Request"
      subtitle="Create a new load service request"
    >
      {/* Progress Steps */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step >= stepNumber 
                    ? 'bg-slate-700 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNumber}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step >= stepNumber ? 'text-slate-700' : 'text-gray-500'
                }`}>
                  {stepNumber === 1 ? 'Details' : stepNumber === 2 ? 'Items' : 'Review'}
                </span>
                {stepNumber < 3 && (
                  <div className={`ml-4 w-16 h-0.5 ${
                    step > stepNumber ? 'bg-slate-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow-lg border border-gray-200 rounded-xl">
          <div className="px-6 py-6 sm:p-8">
            {/* Step 1: Details */}
            {step === 1 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">Request Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Route *</label>
                    <input
                      type="text"
                      value={formData.route}
                      onChange={(e) => handleInputChange('route', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Enter route information"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      placeholder="Add any additional notes or special instructions..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Items */}
            {step === 2 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">Commercial Products & POSM Items</h3>
                
                {/* Commercial Products */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-800">Commercial Products</h4>
                    <button
                      onClick={addCommercialProduct}
                      className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Product
                    </button>
                  </div>
                  
                  {formData.commercialProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center space-x-3 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                      <select
                        value={product.sku}
                        onChange={(e) => {
                          const selectedProduct = products.find(p => p.sku === e.target.value)
                          updateCommercialProduct(index, 'sku', e.target.value)
                          updateCommercialProduct(index, 'name', selectedProduct?.name || '')
                          updateCommercialProduct(index, 'uom', selectedProduct?.defaultUom || 'CASE')
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product.sku} value={product.sku}>
                            {product.sku} - {product.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={product.uom}
                        onChange={(e) => updateCommercialProduct(index, 'uom', e.target.value)}
                        className="w-28 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      >
                        <option value="CASE">CASE</option>
                        <option value="UNIT">UNIT</option>
                      </select>
                      <input
                        type="number"
                        value={product.qty}
                        onChange={(e) => updateCommercialProduct(index, 'qty', parseInt(e.target.value) || 0)}
                        min="0"
                        placeholder="Qty"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      />
                      <button
                        onClick={() => removeCommercialProduct(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Remove product"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* POSM Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-base font-semibold text-gray-800">POSM Items</h4>
                    <button
                      onClick={addPosmItem}
                      className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add POSM
                    </button>
                  </div>
                  
                  {formData.posmItems.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-3 mb-3 p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all">
                      <select
                        value={item.code}
                        onChange={(e) => {
                          const selectedPosm = posmItems.find(p => p.code === e.target.value)
                          updatePosmItem(index, 'code', e.target.value)
                          updatePosmItem(index, 'description', selectedPosm?.description || '')
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                      >
                        <option value="">Select POSM Item</option>
                        {posmItems.map((posm) => (
                          <option key={posm.code} value={posm.code}>
                            {posm.code} - {posm.description}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => updatePosmItem(index, 'qty', parseInt(e.target.value) || 0)}
                        min="0"
                        className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => removePosmItem(index)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Review & Submit</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-800">Request Details</h4>
                    <p><span className="font-medium">Route:</span> {formData.route || 'Not specified'}</p>
                    <p><span className="font-medium">Notes:</span> {formData.notes || 'None'}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800">Commercial Products ({formData.commercialProducts.length})</h4>
                    {formData.commercialProducts.map((product, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {product.name} ({product.sku}) - {product.qty} {product.uom}
                      </p>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800">POSM Items ({formData.posmItems.length})</h4>
                    {formData.posmItems.map((item, index) => (
                      <p key={index} className="text-sm text-gray-600">
                        {item.description} ({item.code}) - {item.qty} units
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <div>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </button>
                )}
              </div>
              
              <div className="flex space-x-3">
                {step < 3 ? (
                  <button
                    onClick={() => setStep(step + 1)}
                    disabled={!canProceed()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || (formData.commercialProducts.length === 0 && formData.posmItems.length === 0)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Request
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

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

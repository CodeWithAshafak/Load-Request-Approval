import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

import BASE_URL from '../../config'

// Helper function to get headers with auth
const getHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

// Async thunks
export const fetchRequests = createAsyncThunk(
  'loadRequest/fetchRequests',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const response = await axios.get(`${BASE_URL}/requests?${queryParams}`, {
        headers: getHeaders()
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch requests')
    }
  }
)

export const createRequest = createAsyncThunk(
  'loadRequest/createRequest',
  async (requestData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/requests`, requestData, {
        headers: getHeaders()
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create request')
    }
  }
)

export const updateRequest = createAsyncThunk(
  'loadRequest/updateRequest',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${BASE_URL}/requests/${id}`, data, {
        headers: getHeaders()
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update request')
    }
  }
)

export const submitRequest = createAsyncThunk(
  'loadRequest/submitRequest',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/requests/${id}/submit`, {}, {
        headers: getHeaders()
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit request')
    }
  }
)

export const approveRequest = createAsyncThunk(
  'loadRequest/approveRequest',
  async ({ id, modifiedData }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/requests/${id}/approve`, modifiedData || {}, {
        headers: getHeaders()
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve request')
    }
  }
)

export const rejectRequest = createAsyncThunk(
  'loadRequest/rejectRequest',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/requests/${id}/reject`, { reason }, {
        headers: getHeaders()
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject request')
    }
  }
)

export const fetchProducts = createAsyncThunk(
  'loadRequest/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/catalog/products`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products')
    }
  }
)

export const fetchPosmItems = createAsyncThunk(
  'loadRequest/fetchPosmItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/catalog/posm`)
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch POSM items')
    }
  }
)

export const fetchNotifications = createAsyncThunk(
  'loadRequest/fetchNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications/${userId}`, {
        headers: getHeaders()
      })
      console.log('Notifications fetched:', response.data)
      return response.data
    } catch (error) {
      console.error('Failed to fetch notifications:', error.response?.data || error.message)
      // Return empty array instead of rejecting to avoid breaking the UI
      return []
    }
  }
)

export const fetchRecommendedLoad = createAsyncThunk(
  'loadRequest/fetchRecommendedLoad',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/lsr/${userId}/recommended-load`, {
        headers: getHeaders()
      })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recommended load')
    }
  }
)

const initialState = {
  requests: [],
  products: [],
  posmItems: [],
  notifications: [],
  recommendedLoad: null,
  loading: false,
  error: null,
  currentRequest: null
}

const loadRequestSlice = createSlice({
  name: 'loadRequest',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setCurrentRequest: (state, action) => {
      state.currentRequest = action.payload
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch requests
      .addCase(fetchRequests.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.loading = false
        state.requests = action.payload
        state.error = null
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Create request
      .addCase(createRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createRequest.fulfilled, (state, action) => {
        state.loading = false
        state.requests.unshift(action.payload)
        state.currentRequest = action.payload
        state.error = null
      })
      .addCase(createRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Update request
      .addCase(updateRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateRequest.fulfilled, (state, action) => {
        state.loading = false
        const index = state.requests.findIndex(req => req.id === action.payload.id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
        state.currentRequest = action.payload
        state.error = null
      })
      .addCase(updateRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Submit request
      .addCase(submitRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(submitRequest.fulfilled, (state, action) => {
        state.loading = false
        const index = state.requests.findIndex(req => req.id === action.payload.id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
        state.currentRequest = action.payload
        state.error = null
      })
      .addCase(submitRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Approve request
      .addCase(approveRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(approveRequest.fulfilled, (state, action) => {
        state.loading = false
        const index = state.requests.findIndex(req => req.id === action.payload.id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
        state.error = null
      })
      .addCase(approveRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Reject request
      .addCase(rejectRequest.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.loading = false
        const index = state.requests.findIndex(req => req.id === action.payload.id)
        if (index !== -1) {
          state.requests[index] = action.payload
        }
        state.error = null
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch products
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.products = action.payload
      })
      // Fetch POSM items
      .addCase(fetchPosmItems.fulfilled, (state, action) => {
        state.posmItems = action.payload
      })
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false
        state.notifications = action.payload
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      // Fetch recommended load
      .addCase(fetchRecommendedLoad.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchRecommendedLoad.fulfilled, (state, action) => {
        state.loading = false
        state.recommendedLoad = action.payload
        state.error = null
      })
      .addCase(fetchRecommendedLoad.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

export const { clearError, setCurrentRequest, clearCurrentRequest } = loadRequestSlice.actions
export default loadRequestSlice.reducer
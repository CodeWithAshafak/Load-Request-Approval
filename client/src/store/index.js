import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import loadRequestReducer from './slices/loadRequestSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    loadRequest: loadRequestReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export default store

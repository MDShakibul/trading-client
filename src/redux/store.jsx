import { configureStore } from '@reduxjs/toolkit'
import authReducher from './features/auth/authSlice';
import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducher,
    [apiSlice.reducerPath]: apiSlice.reducer
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(apiSlice.middleware)
})

export const selectState = (state) => state;
export const selectAppDispatch = () => store.dispatch;

export const selectRootState = () => store.getState();
export const selectAppDispatchType = typeof store.dispatch;
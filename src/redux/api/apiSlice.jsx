import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BASE_URL + "/api/v1",
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      headers.set('authorization', token);
    }
    return headers;
  },
  credentials: 'include', // Ensures cookies (refresh token) are sent automatically
});

const baseQueryWithReauth = async (args, api) => {
  let result = await baseQuery(args, api);

  // If token is expired, refresh it
  if (result.error && result.error.status === 401) {
    // Attempt to refresh the token
    const refreshResult = await baseQuery({ url: '/auth/refresh-token', method: 'POST' }, api);

    if (refreshResult.data) {
      // Store new access token
      localStorage.setItem('access_token', refreshResult.data.access_token);

      // Retry the original request with the new token
      return baseQuery(args, api);
    } else {
      // Refresh failed - Logout user
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_id');
      window.location.href = '/user/signin';
    }
  }

  return result;
};

// Define API Slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['getStocks', 'closeStocks'],
  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
    }),

    signUpVerifiedOtp: builder.mutation({
      query: ({ data }) => ({
        url: `/auth/signup-verify-otp`,
        method: 'POST',
        body: data,
      }),
    }),

    login: builder.mutation({
      query: ({ data }) => ({
        url: `/auth/login`,
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('user_id', data.user_id);
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    getUserProfile: builder.query({
      query: () => ({
        url: `/auth/profile`,
      }),
      providesTags: ['updateProfile'],
    }),

    updateUserProfile: builder.mutation({
      query: ({ data }) => ({
        url: `/auth/profile`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['updateProfile'],
    }),

    forgotPassword: builder.mutation({
      query: ({ data }) => ({
        url: `/auth/forgot-password`,
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: ({ token, data }) => ({
        url: `/auth/reset-password/${token}`,
        method: 'POST',
        body: data,
      }),
    }),

    stockBuySell: builder.mutation({
      query: ({ data }) => ({
        url: `/stocks/buy-sell`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['getStocks'],
    }),

    getStock: builder.query({
      query: () => ({
        url: `/stocks/get-stock`,
      }),
      providesTags: ['getStocks', 'closeStocks'],
    }),

    getCloseStock: builder.query({
      query: () => ({
        url: `/stocks/get-close-stock`,
      }),
      providesTags: ['closeStocks'],
    }),

    closeStock: builder.mutation({
      query: ({ stockName, data }) => ({
        url: `/stocks/close-stock/${stockName}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['closeStocks'],
    }),

    getUserInfo: builder.query({
      query: () => ({
        url: `/user/user-info`,
      }),
    }),
  }),
});

export const {
  useCreateUserMutation,
  useSignUpVerifiedOtpMutation,
  useLoginMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useStockBuySellMutation,
  useGetStockQuery,
  useGetCloseStockQuery,
  useCloseStockMutation,
  useGetUserInfoQuery,
} = apiSlice;

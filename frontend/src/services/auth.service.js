import { fetchAPI, API_ENDPOINTS } from '../api/config'

export const authService = {
  register: (username, email, password, role = 'client') =>
    fetchAPI(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify({ username, email, password, role })
    }),

  verifyOtp: (email, otp) =>
    fetchAPI(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }),

  login: (username, email, password) =>
    fetchAPI(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({
        ...(username && { username }),
        ...(email && { email }),
        password
      })
    }),

  logout: () =>
    fetchAPI(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' }),

  getCurrentUser: () =>
    fetchAPI(API_ENDPOINTS.AUTH.GET_ME, { method: 'GET' }),

  forgotPassword: (email) =>
    fetchAPI(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  verifyForgotOtp: (email, otp) =>
    fetchAPI(API_ENDPOINTS.AUTH.VERIFY_FORGOT_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    }),

  resetPassword: (password) =>
    fetchAPI(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify({ resetpassword: password })
    })
}

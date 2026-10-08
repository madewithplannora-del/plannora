const API_URL = import.meta.env.VITE_API_URL || ''

// Log API URL for debugging
if (typeof window !== 'undefined') {
  console.log('API_URL configured as:', API_URL || '(relative paths - via proxy)')
  console.log('VITE_API_URL env:', import.meta.env.VITE_API_URL)
}

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/auth/register',
    VERIFY_OTP: '/api/auth/verifyotp',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    GET_ME: '/api/auth/me',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgotpassword',
    VERIFY_FORGOT_OTP: '/api/auth/verifyforgototp',
    RESET_PASSWORD: '/api/auth/resetpassword'
  },
  VENDOR_PROFILE: {
    CREATE: '/api/vendorprofile/create',
    UPDATE: '/api/vendorprofile/update',
    DELETE: '/api/vendorprofile/delete',
    GET_BY_ID: (id) => `/api/vendorprofile/${id}`,
    GET_BY_VENDOR_ID: (vendorID) => `/api/vendorprofile/vendor/${vendorID}`,
    CONTACT_CLICK: (id) => `/api/vendorprofile/contact/${id}`
  }
}

export const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  
  console.log('fetchAPI called:', { url, method: options.method || 'GET' })

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  }

  try {
    console.log('Fetching from:', url)
    const response = await fetch(url, config)
    
    console.log('Response received:', { status: response.status, url })

    // Handle 401 - try refresh
    if (response.status === 401 && options.method !== 'POST') {
      const refreshed = await refreshAccessToken()
      if (refreshed) {
        return fetchAPI(endpoint, options)
      }
    }

    let data
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      data = await response.json()
    } else {
      data = await response.text()
    }

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || data || 'API Error',
        data
      }
    }

    return data
  } catch (error) {
    console.error('fetchAPI error:', error)
    if (error instanceof TypeError) {
      console.error('TypeError details:', error.message, error.cause)
      throw {
        status: 0,
        message: `Network error: ${error.message}`,
        error
      }
    }
    throw error
  }
}

export const refreshAccessToken = async () => {
  try {
    await fetch(`${API_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      credentials: 'include'
    })
    return true
  } catch {
    return false
  }
}

export default API_URL

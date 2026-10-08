import { fetchAPI, API_ENDPOINTS } from '../api/config'
import API_URL from '../api/config'

export const vendorService = {
  createProfile: (formData) =>
    fetch(`${API_URL}${API_ENDPOINTS.VENDOR_PROFILE.CREATE}`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw { status: res.status, message: data.message || 'Profile creation failed', data }
      return data
    }),

  updateProfile: (formData) =>
    fetch(`${API_URL}${API_ENDPOINTS.VENDOR_PROFILE.UPDATE}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    }).then(async (res) => {
      const data = await res.json()
      if (!res.ok) throw { status: res.status, message: data.message || 'Profile update failed', data }
      return data
    }),

  deleteProfile: () =>
    fetchAPI(API_ENDPOINTS.VENDOR_PROFILE.DELETE, { method: 'DELETE' }),

  getProfileById: (id) =>
    fetchAPI(API_ENDPOINTS.VENDOR_PROFILE.GET_BY_ID(id), { method: 'GET' }),

  getProfileByVendorId: (vendorId) =>
    fetchAPI(API_ENDPOINTS.VENDOR_PROFILE.GET_BY_VENDOR_ID(vendorId), { method: 'GET' }),

  recordContactClick: (id) =>
    fetchAPI(API_ENDPOINTS.VENDOR_PROFILE.CONTACT_CLICK(id), { method: 'POST' })
}

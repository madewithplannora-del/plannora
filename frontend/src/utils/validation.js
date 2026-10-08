export const validation = {
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(value) ? null : 'Invalid email format'
  },

  username: (value) => {
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) return 'Username can only contain letters, numbers, underscores, and hyphens'
    return null
  },

  password: (value) => {
    if (value.length < 8) return 'Password must be at least 8 characters'
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter'
    if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter'
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
    return null
  },

  phone: (value) => {
    const regex = /^[0-9]{10,15}$/
    return regex.test(value.replace(/\D/g, '')) ? null : 'Invalid phone number'
  },

  url: (value) => {
    try {
      new URL(value)
      return null
    } catch {
      return 'Invalid URL'
    }
  }
}

export const getFieldError = (field, value) => {
  if (!value) return `${field} is required`
  if (field.toLowerCase().includes('email')) return validation.email(value)
  if (field.toLowerCase().includes('username')) return validation.username(value)
  if (field.toLowerCase().includes('password')) return validation.password(value)
  if (field.toLowerCase().includes('phone')) return validation.phone(value)
  return null
}

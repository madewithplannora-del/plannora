import React, { useState } from 'react'

export function Input({
  label,
  error,
  type = 'text',
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false)
  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}
      <div className="input-wrapper">
        <input
          type={inputType}
          className={`input ${error ? 'input-error' : ''}`}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            className="input-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁' : '👁‍🗨'}
          </button>
        )}
      </div>
      {error && <p className="input-error-text">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, required = false, ...props }) {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label} {required && <span className="input-required">*</span>}
        </label>
      )}
      <textarea className={`input input-textarea ${error ? 'input-error' : ''}`} {...props} />
      {error && <p className="input-error-text">{error}</p>}
    </div>
  )
}

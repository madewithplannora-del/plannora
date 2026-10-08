# Plannora Frontend

Production-quality React + Vite frontend for Plannora event planning application.

## Setup

```bash
# Install dependencies
npm install

# Create .env file
echo 'VITE_API_URL=https://plannora-protoype.onrender.com' > .env

# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── main.jsx              # Entry point
├── App.jsx               # Main app component with routing
├── api/
│   └── config.js         # Centralized API configuration
├── services/
│   ├── auth.service.js   # Authentication API calls
│   └── vendor.service.js # Vendor profile API calls
├── context/
│   └── AuthContext.jsx   # Authentication context provider
├── components/
│   ├── Header.jsx        # Navigation header
│   ├── Footer.jsx        # Footer
│   ├── Button.jsx        # Reusable button component
│   ├── Input.jsx         # Input field components
│   └── ProtectedRoute.jsx # Route protection wrapper
├── pages/
│   ├── Home.jsx          # Landing page
│   ├── Login.jsx         # Login page
│   ├── Register.jsx      # Registration page
│   ├── VerifyEmail.jsx   # Email verification
│   ├── ForgotPassword.jsx # Password recovery
│   ├── ResetPassword.jsx # Password reset
│   ├── Vendors.jsx       # Vendor listing
│   ├── VendorProfile.jsx # Individual vendor profile
│   ├── Dashboard.jsx     # Client dashboard
│   ├── VendorDashboard.jsx # Vendor management
│   └── Profile.jsx       # User profile
├── utils/
│   └── validation.js     # Form validation helpers
└── styles/
    ├── global.css        # Global styles
    ├── components.css    # Component styles
    └── pages.css         # Page-specific styles
```

## Environment Variables

### Development
```
VITE_API_URL=http://localhost:3000
```

### Production (Vercel)
```
VITE_API_URL=https://plannora-protoype.onrender.com
```

## Backend Integration

All API calls route through centralized config:
- `src/api/config.js` - API URL and fetch wrapper
- `src/services/*.service.js` - Business logic for each feature
- Automatic token refresh on 401
- Cookie-based authentication with credentials: 'include'

## Deployment to Vercel

1. Connect GitHub repository to Vercel
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variable: `VITE_API_URL=https://plannora-protoype.onrender.com`
6. Deploy

## Key Features

- ✅ Responsive design (mobile-first)
- ✅ Cookie-based authentication
- ✅ Protected routes with role checking
- ✅ GSAP animations (hero section)
- ✅ Color scheme: Burnt Orange, Warm Ivory, Soft Black, Crimson Red
- ✅ Typography: Syne, Montserrat, Open Sans, Quicksand
- ✅ Premium, event-focused design
- ✅ No hardcoded secrets
- ✅ Proper error handling
- ✅ Loading states
- ✅ Form validation

## Security

- No backend secrets in frontend
- No API keys in frontend
- Environment variables only via VITE_ prefix
- Cookies handled by browser (httpOnly)
- CSP headers configured in HTML
- HTTPS enforced for API calls

## Testing Checklist

- [ ] npm install works
- [ ] npm run dev starts development server
- [ ] All pages load correctly
- [ ] Registration flow works end-to-end
- [ ] Login/logout works
- [ ] Protected routes redirect properly
- [ ] Responsive on mobile/tablet/desktop
- [ ] npm run build succeeds
- [ ] Production build shows no console errors
- [ ] API calls use correct backend URL

## Build Output

```bash
npm run build
# Output in dist/ folder ready for Vercel deployment
```

## Support

For issues or questions:
- Check backend API at https://plannora-protoype.onrender.com
- Review API documentation in DEPLOYMENT_GUIDE.md
- Verify environment variables in Vercel dashboard

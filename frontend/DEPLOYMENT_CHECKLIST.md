# Plannora Frontend - Deployment Checklist

## Pre-Deployment Testing (Local)

### Setup
- [ ] Run `npm install` - all dependencies installed
- [ ] Create `.env` file with `VITE_API_URL=http://localhost:3000`
- [ ] Backend running on port 3000

### Development Server
- [ ] `npm run dev` starts without errors
- [ ] Frontend loads at `http://localhost:5173`
- [ ] No console errors on load
- [ ] No console warnings

### Page Loads
- [ ] Home page loads with GSAP animation
- [ ] Login page accessible
- [ ] Register page accessible
- [ ] All pages render without errors
- [ ] Footer appears on all pages
- [ ] Header navigation appears on all pages

### Responsive Design
- [ ] Test on mobile (dev tools 375px)
- [ ] Test on tablet (dev tools 768px)
- [ ] Test on desktop (dev tools 1440px)
- [ ] Mobile menu toggle works
- [ ] Forms stack properly on mobile
- [ ] All text readable on all sizes
- [ ] Buttons clickable on mobile

### Authentication Flow
- [ ] Register page has email validation
- [ ] Register accepts vendor/client selection
- [ ] Verify email page loads with OTP input
- [ ] Login accepts username or email
- [ ] Login sets cookies (check DevTools)
- [ ] Logout clears cookies
- [ ] Protected routes redirect to login when not authenticated

### Form Validation
- [ ] Empty field shows validation error
- [ ] Invalid email shows error
- [ ] Password too short shows error
- [ ] Passwords don't match shows error
- [ ] Form submits with valid data

### Loading & Error States
- [ ] Submit button shows loading spinner
- [ ] Error messages display properly
- [ ] Success messages display (if any)
- [ ] Disabled buttons can't be clicked

### API Integration
- [ ] Network tab shows API calls to backend
- [ ] API calls use correct endpoint
- [ ] Cookies included in requests (credentials: include)
- [ ] Response data displayed correctly
- [ ] Errors handled gracefully

### Styling & Design
- [ ] Colors match spec (burnt orange, warm ivory, soft black, crimson)
- [ ] Typography matches spec (Syne, Montserrat, Open Sans, Quicksand)
- [ ] No generic SaaS design feel
- [ ] Premium, professional appearance
- [ ] Event-focused aesthetic

### Build
- [ ] `npm run build` completes without errors
- [ ] Build output in `dist/` folder
- [ ] No console errors in build output
- [ ] No console warnings in build output
- [ ] `npm run preview` works (test production build locally)

---

## Vercel Deployment Steps

### Repository Setup
- [ ] Push all frontend code to GitHub
- [ ] Ensure `frontend` directory is in root
- [ ] `.gitignore` excludes node_modules and `.env`
- [ ] `.env.example` exists with `VITE_API_URL=https://plannora-protoype.onrender.com`

### Vercel Configuration
- [ ] Go to vercel.com
- [ ] Connect GitHub account
- [ ] Select `plannora` repository
- [ ] Set root directory: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

### Environment Variables
- [ ] Add `VITE_API_URL` = `https://plannora-protoype.onrender.com`
- [ ] Set environment: Production
- [ ] Save and redeploy

### Initial Deployment
- [ ] Click "Deploy"
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Check build logs for errors
- [ ] Deployment successful message appears
- [ ] Frontend URL provided (https://plannora-[name].vercel.app)

---

## Post-Deployment Verification

### Frontend Access
- [ ] Frontend loads at Vercel URL
- [ ] No 404 or 500 errors
- [ ] All pages accessible
- [ ] Styling looks correct
- [ ] Images/assets load
- [ ] Hero animation plays

### Navigation & Routing
- [ ] Header links work
- [ ] Footer links work
- [ ] React Router links work
- [ ] Page refresh doesn't break routes
- [ ] Browser back/forward works
- [ ] Mobile menu works

### API Integration (Production)
- [ ] Network tab shows API calls to `https://plannora-protoype.onrender.com`
- [ ] No CORS errors
- [ ] Cookies set and sent correctly
- [ ] API responses show correct data
- [ ] Error responses handled gracefully

### User Flows
- [ ] Can navigate to register
- [ ] Can register new account
- [ ] Email verification works
- [ ] Can login with credentials
- [ ] Dashboard loads after login
- [ ] Vendor pages accessible
- [ ] Logout works
- [ ] Protected routes block unauthorized access

### Performance
- [ ] Pages load in < 3 seconds
- [ ] No layout shifts (CLS)
- [ ] No jank/stuttering
- [ ] Smooth animations
- [ ] Hero animation plays smoothly

### Mobile Experience (Production)
- [ ] Responsive on mobile Safari
- [ ] Responsive on Chrome mobile
- [ ] Touch interactions work
- [ ] Forms usable on mobile
- [ ] No horizontal scroll
- [ ] Text readable

### Console & Errors
- [ ] No console errors
- [ ] No console warnings
- [ ] No 404 for static assets
- [ ] No CORS errors
- [ ] Network requests successful

### Security (Production)
- [ ] HTTPS enforced
- [ ] No secrets in frontend code
- [ ] No credentials exposed
- [ ] Cookies marked secure
- [ ] CSP headers correct

---

## Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Pages Show 404
- Verify Vercel SPA routing configured
- Check if `dist/index.html` exists
- Check vercel.json rewrites

### API 404 Errors
- Verify `VITE_API_URL` in Vercel environment variables
- Check backend is running on Render
- Check API endpoint paths match backend

### Cookies Not Sent
- Verify frontend and backend use HTTPS in production
- Check `credentials: 'include'` in fetch calls
- Check CORS headers on backend

### Styling Broken
- Check if CSS files loaded (Network tab)
- Verify font imports from googleapis
- Check build output includes CSS

### Animation Not Playing
- Verify GSAP CDN accessible
- Check console for GSAP errors
- Ensure JavaScript enabled in browser

---

## Monitoring (Post-Deployment)

### Regular Checks
- [ ] Frontend still loads daily
- [ ] API responses working
- [ ] No 500 errors
- [ ] Performance metrics normal
- [ ] User feedback positive

### Analytics (Optional)
- [ ] Page view tracking
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User session tracking

---

## Final Verification

When all checks pass, frontend is successfully deployed and ready for production use:

**✅ Frontend fully operational**
**✅ Backend integration working**
**✅ User authentication functional**
**✅ All pages accessible**
**✅ Responsive on all devices**
**✅ Secure and performant**

Deployment is complete!

---

## Support & Maintenance

### Reporting Issues
- Check Vercel deployment logs
- Review browser console for errors
- Check Network tab for failed requests
- Contact backend team if API issues

### Updating Frontend
```bash
# Make changes locally
# Test with npm run dev
# Build with npm run build
# Push to GitHub
# Vercel auto-deploys
```

### Rollback
- Vercel stores deployment history
- Click "Deployments" tab
- Select previous deployment
- Click "Promote to Production"


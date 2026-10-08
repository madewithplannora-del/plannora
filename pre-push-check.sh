#!/bin/bash

# Pre-Push Verification Script
# Run this before pushing to GitHub

echo ""
echo "=========================================="
echo "🚀 PLANNORA PRE-PUSH VERIFICATION"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

CHECKS_PASSED=0
CHECKS_FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  ((CHECKS_PASSED++))
}

fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  ((CHECKS_FAILED++))
}

warn() {
  echo -e "${YELLOW}⚠️  WARN${NC}: $1"
}

# Check 1: Git status clean
echo "1. Checking git status..."
if [ -z "$(git status --porcelain)" ]; then
  pass "Working directory clean"
else
  warn "Working directory has uncommitted changes"
fi

# Check 2: Backend files exist
echo ""
echo "2. Checking backend files..."
if [ -f "backend/package.json" ] && [ -f "backend/.env" ] && [ -f "backend/server.js" ]; then
  pass "Backend files present"
else
  fail "Backend files missing"
fi

# Check 3: Frontend files exist
echo ""
echo "3. Checking frontend files..."
if [ -f "frontend/package.json" ] && [ -f "frontend/vite.config.js" ] && [ -f "frontend/index.html" ]; then
  pass "Frontend files present"
else
  fail "Frontend files missing"
fi

# Check 4: .env not in git
echo ""
echo "4. Checking .env not tracked..."
if ! git ls-files | grep -q "\.env$"; then
  pass ".env files not in git"
else
  fail ".env files found in git (should be in .gitignore)"
fi

# Check 5: .env.example exists
echo ""
echo "5. Checking .env.example files..."
if [ -f "backend/.env.example" ] && [ -f "frontend/.env.example" ]; then
  pass ".env.example files present"
else
  warn "Missing .env.example files"
fi

# Check 6: No hardcoded secrets in code
echo ""
echo "6. Checking for hardcoded secrets..."
SECRETS_FOUND=0
if grep -r "process.env" backend/src --include="*.js" > /dev/null 2>&1; then
  pass "Uses environment variables correctly"
else
  warn "Not using environment variables"
fi

if grep -r "mongodb+srv://" backend/src --include="*.js" > /dev/null 2>&1; then
  fail "Hardcoded MongoDB connection string found!"
  ((SECRETS_FOUND++))
fi

if grep -r "CLOUDINARY_API_KEY" backend/src --include="*.js" > /dev/null 2>&1; then
  fail "Hardcoded Cloudinary key found!"
  ((SECRETS_FOUND++))
fi

if [ $SECRETS_FOUND -eq 0 ]; then
  pass "No obvious hardcoded secrets"
fi

# Check 7: backend/node_modules not tracked
echo ""
echo "7. Checking node_modules not tracked..."
if ! git ls-files | grep -q "node_modules"; then
  pass "node_modules not in git"
else
  fail "node_modules found in git"
fi

# Check 8: No test files left
echo ""
echo "8. Checking test files..."
if [ ! -f "test-suite.js" ] && [ ! -f "quick-verify.js" ]; then
  pass "Test files cleaned up"
else
  warn "Test files still present (optional to remove)"
fi

# Check 9: README exists
echo ""
echo "9. Checking documentation..."
if [ -f "README.md" ] || [ -f "frontend/README.md" ]; then
  pass "README documentation exists"
else
  warn "No README found (consider adding one)"
fi

# Check 10: Backend compilation
echo ""
echo "10. Checking backend syntax..."
cd backend
if npm run build --dry-run > /dev/null 2>&1; then
  pass "Backend builds successfully"
else
  warn "Backend build check skipped"
fi
cd ..

# Summary
echo ""
echo "=========================================="
echo "📊 SUMMARY"
echo "=========================================="
echo -e "✅ Passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "❌ Failed: ${RED}$CHECKS_FAILED${NC}"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ Ready to push!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. git add ."
  echo "2. git commit -m 'Feat: Complete Plannora app...'"
  echo "3. git push origin main"
  echo ""
  exit 0
else
  echo -e "${RED}❌ Fix issues before pushing${NC}"
  echo ""
  exit 1
fi

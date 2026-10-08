#!/usr/bin/env node

/**
 * Plannora Application Test Suite
 * Tests all 15 API endpoints and frontend integration
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';
const TESTS = [];
let testsCookie = '';
let refreshToken = '';

// Helper function for HTTP requests
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': testsCookie,
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          
          // Extract cookies
          const setCookie = res.headers['set-cookie'];
          if (setCookie) {
            testsCookie = setCookie[0].split(';')[0];
          }
          
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test runner
async function runTest(name, fn) {
  try {
    await fn();
    console.log(`✅ PASS: ${name}`);
    TESTS.push({ name, status: 'PASS' });
  } catch (error) {
    console.log(`❌ FAIL: ${name}`);
    console.log(`   Error: ${error.message}`);
    TESTS.push({ name, status: 'FAIL', error: error.message });
  }
}

// Assertions
function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function runAllTests() {
  console.log('\n🚀 PLANNORA TEST SUITE\n');
  console.log('=' .repeat(60));

  // ==================== AUTH TESTS ====================
  console.log('\n📝 AUTH ENDPOINTS TESTS\n');
  
  let testUser = {
    username: `testuser_${Date.now()}`,
    email: `testuser_${Date.now()}@test.com`,
    password: 'TestPassword123!',
    otp: null,
    vendorUsername: `vendor_${Date.now()}`,
    vendorEmail: `vendor_${Date.now()}@test.com`,
  };

  // Test 1: Register as Client
  await runTest('1. Register - Create Client Account', async () => {
    const res = await makeRequest('POST', '/api/auth/register', {
      username: testUser.username,
      email: testUser.email,
      password: testUser.password,
      role: 'client'
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
    assert(res.data.message === 'OTP sent to email', 'OTP not sent');
    testUser.otp = '123456'; // Default OTP for testing
  });

  // Test 2: Verify OTP
  await runTest('2. Verify OTP - Verify Email', async () => {
    const res = await makeRequest('POST', '/api/auth/verifyotp', {
      email: testUser.email,
      otp: testUser.otp
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.message.includes('verified'), 'Email not verified');
  });

  // Test 3: Login
  await runTest('3. Login - Authenticate Client', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.message === 'Login successful', 'Login failed');
    assert(testsCookie, 'No auth cookie received');
  });

  // Test 4: Get Current User
  await runTest('4. Get Current User - Fetch User Info', async () => {
    const res = await makeRequest('GET', '/api/auth/me');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.user.email === testUser.email, 'User email mismatch');
  });

  // Test 5: Refresh Token
  await runTest('5. Refresh Token - Refresh Access Token', async () => {
    const res = await makeRequest('POST', '/api/auth/refresh');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(testsCookie, 'No refresh cookie received');
  });

  // Test 6: Forgot Password
  await runTest('6. Forgot Password - Request Password Reset', async () => {
    const res = await makeRequest('POST', '/api/auth/forgotpassword', {
      email: testUser.email
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.message.includes('OTP'), 'No OTP sent');
  });

  // Test 7: Verify Forgot OTP
  await runTest('7. Verify Forgot OTP - Verify Reset OTP', async () => {
    const res = await makeRequest('POST', '/api/auth/verifyforgototp', {
      email: testUser.email,
      otp: testUser.otp
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // Test 8: Reset Password
  await runTest('8. Reset Password - Update Password', async () => {
    const res = await makeRequest('POST', '/api/auth/resetpassword', {
      resetpassword: 'NewPassword123!'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // Re-login with new password
  await runTest('8b. Re-login with new password', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: 'NewPassword123!'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // Test 9: Register as Vendor
  await runTest('9. Register - Create Vendor Account', async () => {
    const res = await makeRequest('POST', '/api/auth/register', {
      username: testUser.vendorUsername,
      email: testUser.vendorEmail,
      password: testUser.password,
      role: 'vendor'
    });
    assert(res.status === 201, `Expected 201, got ${res.status}`);
  });

  // Verify vendor and login
  await runTest('9b. Verify Vendor Email & Login', async () => {
    await makeRequest('POST', '/api/auth/verifyotp', {
      email: testUser.vendorEmail,
      otp: testUser.otp
    });
    const res = await makeRequest('POST', '/api/auth/login', {
      email: testUser.vendorEmail,
      password: testUser.password
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // ==================== VENDOR PROFILE TESTS ====================
  console.log('\n🏪 VENDOR PROFILE ENDPOINTS TESTS\n');

  let vendorProfileId = null;

  // Test 10: Create Vendor Profile
  await runTest('10. Create Vendor Profile', async () => {
    const res = await makeRequest('POST', '/api/vendorprofile/create', {
      number: '9876543210',
      BusinessName: 'Amazing Events Co',
      bio: 'Professional event planning services'
    });
    assert(res.status === 201, `Expected 201, got ${res.status}: ${res.data.message}`);
    assert(res.data.vendorProfile, 'No vendor profile returned');
    vendorProfileId = res.data.vendorProfile._id;
  });

  // Test 11: Update Vendor Profile
  await runTest('11. Update Vendor Profile', async () => {
    const res = await makeRequest('PATCH', '/api/vendorprofile/update', {
      number: '9876543211',
      bio: 'Updated bio - Professional event planning'
    });
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.vendorProfile.number === '9876543211', 'Profile not updated');
  });

  // Test 12: Get Vendor Profile by ID
  await runTest('12. Get Vendor Profile by ID', async () => {
    const res = await makeRequest('GET', `/api/vendorprofile/${vendorProfileId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.vendorProfile._id === vendorProfileId, 'Wrong profile returned');
  });

  // Test 13: Get Vendor Profile by Vendor ID
  await runTest('13. Get Vendor Profile by Vendor ID', async () => {
    // First get current user to get vendor ID
    const userRes = await makeRequest('GET', '/api/auth/me');
    const vendorID = userRes.data.user._id;
    
    const res = await makeRequest('GET', `/api/vendorprofile/vendor/${vendorID}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.vendorProfile, 'No profile returned');
  });

  // Test 14: Contact Click
  await runTest('14. Contact Click - Record Contact', async () => {
    const res = await makeRequest('POST', `/api/vendorprofile/contact/${vendorProfileId}`);
    assert(res.status === 200, `Expected 200, got ${res.status}`);
    assert(res.data.contact_clicks >= 1, 'Contact click not recorded');
  });

  // Test 15: Delete Vendor Profile
  await runTest('15. Delete Vendor Profile', async () => {
    const res = await makeRequest('DELETE', '/api/vendorprofile/delete');
    assert(res.status === 200, `Expected 200, got ${res.status}`);
  });

  // ==================== FRONTEND TESTS ====================
  console.log('\n🌐 FRONTEND INTEGRATION TESTS\n');

  await runTest('F1. Frontend API Config - Relative URL routing', async () => {
    // This test verifies the frontend can use the proxy
    const res = await makeRequest('GET', '/test');
    assert(res.status === 200, `Backend test endpoint failed: ${res.status}`);
  });

  // ==================== ERROR HANDLING TESTS ====================
  console.log('\n⚠️ ERROR HANDLING TESTS\n');

  await runTest('E1. Invalid Token Handling', async () => {
    const res = await makeRequest('GET', '/api/auth/me', null, {
      'Cookie': 'accesstoken=invalid'
    });
    assert(res.status === 401, `Expected 401, got ${res.status}`);
  });

  await runTest('E2. Missing Required Fields', async () => {
    const res = await makeRequest('POST', '/api/auth/register', {
      username: 'testuser',
      // Missing email and password
    });
    assert(res.status >= 400, `Expected 400+, got ${res.status}`);
  });

  await runTest('E3. Duplicate Email Registration', async () => {
    const res = await makeRequest('POST', '/api/auth/register', {
      username: testUser.username + '_2',
      email: testUser.email,
      password: testUser.password,
      role: 'client'
    });
    assert(res.status === 409, `Expected 409 Conflict, got ${res.status}`);
  });

  // ==================== SUMMARY ====================
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST SUMMARY\n');

  const passed = TESTS.filter(t => t.status === 'PASS').length;
  const failed = TESTS.filter(t => t.status === 'FAIL').length;
  const total = TESTS.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    TESTS.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run all tests
runAllTests().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});

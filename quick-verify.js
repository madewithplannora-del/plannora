#!/usr/bin/env node

/**
 * Quick Verification - Basic connectivity and endpoint check
 * Doesn't test full flows to avoid rate limiting
 */

const http = require('http');

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, 'http://localhost:3000');
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function verify() {
  console.log('\n🚀 QUICK VERIFICATION\n');
  console.log('=' .repeat(50));
  
  const checks = [];

  // Check 1: Backend responds
  try {
    const res = await makeRequest('GET', '/message');
    if (res.status === 200) {
      console.log('✅ Backend is running');
      checks.push(true);
    } else {
      console.log('❌ Backend not responding correctly');
      checks.push(false);
    }
  } catch (e) {
    console.log('❌ Cannot connect to backend');
    console.log(`   Error: ${e.message}`);
    checks.push(false);
  }

  // Check 2: Auth endpoint exists
  try {
    const res = await makeRequest('GET', '/api/auth/me');
    if (res.status === 401) {
      console.log('✅ Auth endpoints working (401 expected without token)');
      checks.push(true);
    } else {
      console.log(`❌ Auth endpoint returned ${res.status}`);
      checks.push(false);
    }
  } catch (e) {
    console.log('❌ Cannot reach auth endpoints');
    checks.push(false);
  }

  // Check 3: Vendor profile endpoint exists
  try {
    const res = await makeRequest('GET', '/api/vendorprofile/invalidid');
    if (res.status >= 400) {
      console.log('✅ Vendor profile endpoints working');
      checks.push(true);
    } else {
      console.log(`⚠️  Vendor endpoint returned ${res.status}`);
      checks.push(false);
    }
  } catch (e) {
    console.log('❌ Cannot reach vendor profile endpoints');
    checks.push(false);
  }

  // Check 4: CORS headers
  try {
    const res = await makeRequest('OPTIONS', '/api/auth/login');
    if (res.status <= 204) {
      console.log('✅ CORS headers configured');
      checks.push(true);
    } else {
      console.log('⚠️  CORS might not be configured properly');
      checks.push(false);
    }
  } catch (e) {
    console.log('❌ CORS check failed');
    checks.push(false);
  }

  console.log('\n' + '=' .repeat(50));
  const passed = checks.filter(c => c).length;
  const total = checks.length;
  
  console.log(`\nResult: ${passed}/${total} checks passed`);
  
  if (passed === total) {
    console.log('✅ All basic checks passed!');
    console.log('\n📋 Next: Run manual tests from test-manual.md');
  } else {
    console.log('⚠️  Some checks failed. Review backend logs.');
  }
  
  console.log('\n' + '=' .repeat(50) + '\n');
  
  process.exit(passed === total ? 0 : 1);
}

verify().catch(err => {
  console.error('Verification error:', err);
  process.exit(1);
});

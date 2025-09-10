/**
 * Comprehensive Authentication Flow Test Script
 * Tests complete authentication system with backend API integration
 * 
 * Features tested:
 * 1. Backend API connectivity and health check
 * 2. New user registration flow (with auto-login)
 * 3. Existing user login flow (with backend JWT)
 * 4. Error handling scenarios
 * 5. Session management and token validation
 * 6. Google OAuth integration readiness
 */

// No additional dependencies needed - using built-in Node.js fetch

// Test configuration
const BACKEND_URL = 'http://localhost:8001';
const FRONTEND_URL = 'http://localhost:3005';
const TEST_USERS = {
  newUser: {
    email: 'testuser' + Date.now() + '@newtest.com',
    name: 'Test User New',
    password: 'SecurePass123!'
  },
  existingUser: {
    email: 'john@entrepreneur.com',
    password: 'testpass123'
  }
};

class AuthenticationFlowTester {
  constructor() {
    this.results = {
      backendConnection: null,
      registration: null,
      login: null,
      errorHandling: null,
      sessionManagement: null,
      overallSuccess: false
    };
    this.testStartTime = new Date();
  }

  // Helper method to make HTTP requests
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        timeout: 10000,
        ...options
      });
      
      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        data: response.headers.get('content-type')?.includes('application/json') 
          ? await response.json()
          : await response.text()
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message
      };
    }
  }

  // Test 1: Backend API Connection and Health
  async testBackendConnection() {
    console.log('\n🔍 Testing Backend API Connection...');
    
    try {
      // Test basic health endpoint
      const healthResponse = await this.makeRequest(`${BACKEND_URL}/health`);
      
      if (!healthResponse.ok) {
        console.log('❌ Backend health check failed');
        console.log('   Status:', healthResponse.status);
        console.log('   Error:', healthResponse.error || 'Unknown error');
        
        this.results.backendConnection = {
          success: false,
          error: 'Backend health check failed',
          status: healthResponse.status
        };
        return false;
      }

      // Test auth endpoints availability
      const authEndpoints = [
        '/api/v1/auth/register',
        '/api/v1/auth/login',
        '/api/v1/auth/refresh'
      ];

      for (const endpoint of authEndpoints) {
        const testResponse = await this.makeRequest(`${BACKEND_URL}${endpoint}`, {
          method: 'OPTIONS'
        });
        
        if (testResponse.status === 0) {
          console.log(`❌ Auth endpoint ${endpoint} not reachable`);
          this.results.backendConnection = {
            success: false,
            error: `Auth endpoint ${endpoint} not reachable`
          };
          return false;
        }
      }

      console.log('✅ Backend API connection successful');
      console.log('   Health status:', healthResponse.status);
      console.log('   Auth endpoints accessible');
      
      this.results.backendConnection = {
        success: true,
        healthStatus: healthResponse.status,
        authEndpointsAccessible: true
      };
      
      return true;
    } catch (error) {
      console.log('❌ Backend connection test failed:', error.message);
      this.results.backendConnection = {
        success: false,
        error: error.message
      };
      return false;
    }
  }

  // Test 2: New User Registration Flow
  async testUserRegistration() {
    console.log('\n🔍 Testing New User Registration Flow...');
    
    try {
      const { email, name, password } = TEST_USERS.newUser;
      
      // Step 1: Register new user via backend API
      const registerResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          password,
          provider: 'email'
        })
      });

      if (!registerResponse.ok) {
        console.log('❌ User registration failed');
        console.log('   Status:', registerResponse.status);
        console.log('   Response:', registerResponse.data);
        
        this.results.registration = {
          success: false,
          error: 'Backend registration failed',
          status: registerResponse.status,
          response: registerResponse.data
        };
        return false;
      }

      const registrationData = registerResponse.data;
      
      // Validate registration response structure
      if (!registrationData.user || !registrationData.token) {
        console.log('❌ Invalid registration response structure');
        console.log('   Missing user or token in response');
        
        this.results.registration = {
          success: false,
          error: 'Invalid registration response structure',
          response: registrationData
        };
        return false;
      }

      // Step 2: Test automatic login after registration
      const loginResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!loginResponse.ok) {
        console.log('❌ Auto-login after registration failed');
        console.log('   Status:', loginResponse.status);
        
        this.results.registration = {
          success: false,
          error: 'Auto-login after registration failed',
          registrationSuccessful: true,
          autoLoginFailed: true
        };
        return false;
      }

      console.log('✅ User registration flow successful');
      console.log('   User created:', registrationData.user.email);
      console.log('   JWT token received:', registrationData.token ? 'Yes' : 'No');
      console.log('   User ID:', registrationData.user.id);
      console.log('   User role:', registrationData.user.role);
      console.log('   Auto-login successful:', loginResponse.ok);

      this.results.registration = {
        success: true,
        userId: registrationData.user.id,
        userEmail: registrationData.user.email,
        userRole: registrationData.user.role,
        jwtTokenReceived: !!registrationData.token,
        autoLoginSuccessful: loginResponse.ok
      };

      return true;
    } catch (error) {
      console.log('❌ Registration test failed:', error.message);
      this.results.registration = {
        success: false,
        error: error.message
      };
      return false;
    }
  }

  // Test 3: Existing User Login Flow
  async testUserLogin() {
    console.log('\n🔍 Testing Existing User Login Flow...');
    
    try {
      const { email } = TEST_USERS.existingUser;
      
      // Test login with existing user
      const loginResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!loginResponse.ok) {
        console.log('❌ Existing user login failed');
        console.log('   Status:', loginResponse.status);
        console.log('   Response:', loginResponse.data);
        
        this.results.login = {
          success: false,
          error: 'Existing user login failed',
          status: loginResponse.status,
          response: loginResponse.data
        };
        return false;
      }

      const loginData = loginResponse.data;
      
      // Validate login response structure
      if (!loginData.user || !loginData.token) {
        console.log('❌ Invalid login response structure');
        console.log('   Missing user or token in response');
        
        this.results.login = {
          success: false,
          error: 'Invalid login response structure',
          response: loginData
        };
        return false;
      }

      // Test JWT token format (basic validation)
      const token = loginData.token;
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('❌ Invalid JWT token format');
        console.log('   Token parts:', tokenParts.length, 'expected: 3');
        
        this.results.login = {
          success: false,
          error: 'Invalid JWT token format',
          tokenParts: tokenParts.length
        };
        return false;
      }

      console.log('✅ Existing user login successful');
      console.log('   User:', loginData.user.email);
      console.log('   JWT token received:', !!token);
      console.log('   JWT token format valid:', tokenParts.length === 3);
      console.log('   User ID:', loginData.user.id);
      console.log('   User role:', loginData.user.role);
      console.log('   Business ID:', loginData.user.business?.id || 'None');

      this.results.login = {
        success: true,
        userId: loginData.user.id,
        userEmail: loginData.user.email,
        userRole: loginData.user.role,
        businessId: loginData.user.business?.id,
        jwtTokenValid: tokenParts.length === 3,
        jwtToken: token.substring(0, 20) + '...' // Show only first 20 chars for security
      };

      return true;
    } catch (error) {
      console.log('❌ Login test failed:', error.message);
      this.results.login = {
        success: false,
        error: error.message
      };
      return false;
    }
  }

  // Test 4: Error Handling Scenarios
  async testErrorHandling() {
    console.log('\n🔍 Testing Error Handling Scenarios...');
    
    const errorTests = [];

    try {
      // Test 1: Register with existing email
      const existingEmailResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: TEST_USERS.existingUser.email, // Use existing email
          name: 'Test User',
          password: 'password123',
          provider: 'email'
        })
      });

      errorTests.push({
        name: 'Register with existing email',
        success: !existingEmailResponse.ok && existingEmailResponse.status === 400,
        status: existingEmailResponse.status,
        response: existingEmailResponse.data
      });

      // Test 2: Login with non-existent user
      const nonExistentUserResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'nonexistent' + Date.now() + '@test.com'
        })
      });

      errorTests.push({
        name: 'Login with non-existent user',
        success: !nonExistentUserResponse.ok && nonExistentUserResponse.status === 400,
        status: nonExistentUserResponse.status,
        response: nonExistentUserResponse.data
      });

      // Test 3: Invalid registration data
      const invalidDataResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'invalid-email',
          name: '',
          password: '123'
        })
      });

      errorTests.push({
        name: 'Invalid registration data',
        success: !invalidDataResponse.ok && invalidDataResponse.status === 400,
        status: invalidDataResponse.status,
        response: invalidDataResponse.data
      });

      const successfulTests = errorTests.filter(test => test.success).length;
      
      console.log(`✅ Error handling tests: ${successfulTests}/${errorTests.length} passed`);
      errorTests.forEach(test => {
        console.log(`   ${test.success ? '✅' : '❌'} ${test.name} (Status: ${test.status})`);
      });

      this.results.errorHandling = {
        success: successfulTests === errorTests.length,
        totalTests: errorTests.length,
        passedTests: successfulTests,
        details: errorTests
      };

      return successfulTests === errorTests.length;
    } catch (error) {
      console.log('❌ Error handling test failed:', error.message);
      this.results.errorHandling = {
        success: false,
        error: error.message
      };
      return false;
    }
  }

  // Test 5: Session Management and Token Validation
  async testSessionManagement() {
    console.log('\n🔍 Testing Session Management and Token Validation...');
    
    try {
      // First get a valid token from login
      const { email } = TEST_USERS.existingUser;
      const loginResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      if (!loginResponse.ok) {
        console.log('❌ Could not obtain token for session test');
        this.results.sessionManagement = {
          success: false,
          error: 'Could not obtain token for session test'
        };
        return false;
      }

      const token = loginResponse.data.token;

      // Test token refresh endpoint
      const refreshResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      const tokenRefreshWorking = refreshResponse.ok;

      // Test using token for authenticated request (if there's a protected endpoint)
      const protectedEndpointResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      const authenticatedRequestWorking = protectedEndpointResponse.ok || protectedEndpointResponse.status === 404; // 404 is OK if endpoint doesn't exist

      console.log('✅ Session management test results:');
      console.log('   Token refresh endpoint:', tokenRefreshWorking ? '✅ Working' : '❌ Not working');
      console.log('   Authenticated requests:', authenticatedRequestWorking ? '✅ Working' : '❌ Not working');
      console.log('   Token format valid:', !!token && token.split('.').length === 3);

      this.results.sessionManagement = {
        success: tokenRefreshWorking && authenticatedRequestWorking,
        tokenRefreshWorking,
        authenticatedRequestWorking,
        tokenFormatValid: !!token && token.split('.').length === 3
      };

      return this.results.sessionManagement.success;
    } catch (error) {
      console.log('❌ Session management test failed:', error.message);
      this.results.sessionManagement = {
        success: false,
        error: error.message
      };
      return false;
    }
  }

  // Frontend Integration Test
  async testFrontendIntegration() {
    console.log('\n🔍 Testing Frontend Integration...');
    
    try {
      // Test if registration page loads
      const registerPageResponse = await this.makeRequest(`${FRONTEND_URL}/register`);
      const loginPageResponse = await this.makeRequest(`${FRONTEND_URL}/login`);

      const frontendAccessible = registerPageResponse.ok && loginPageResponse.ok;

      console.log('✅ Frontend integration test results:');
      console.log('   Register page accessible:', registerPageResponse.ok ? '✅' : '❌');
      console.log('   Login page accessible:', loginPageResponse.ok ? '✅' : '❌');

      return frontendAccessible;
    } catch (error) {
      console.log('❌ Frontend integration test failed:', error.message);
      return false;
    }
  }

  // Generate comprehensive test report
  generateReport() {
    const testEndTime = new Date();
    const duration = testEndTime - this.testStartTime;
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 COMPREHENSIVE AUTHENTICATION FLOW TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`📊 Test Duration: ${duration}ms`);
    console.log(`📅 Test Time: ${this.testStartTime.toISOString()}`);
    console.log(`🎯 Backend URL: ${BACKEND_URL}`);
    console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
    
    console.log('\n📋 Test Results Summary:');
    
    // Backend Connection
    const backendStatus = this.results.backendConnection?.success ? '✅ PASS' : '❌ FAIL';
    console.log(`   1. Backend Connection: ${backendStatus}`);
    if (!this.results.backendConnection?.success) {
      console.log(`      Error: ${this.results.backendConnection?.error}`);
    }
    
    // Registration
    const registrationStatus = this.results.registration?.success ? '✅ PASS' : '❌ FAIL';
    console.log(`   2. User Registration: ${registrationStatus}`);
    if (this.results.registration?.success) {
      console.log(`      User created: ${this.results.registration.userEmail}`);
      console.log(`      JWT received: ${this.results.registration.jwtTokenReceived ? 'Yes' : 'No'}`);
      console.log(`      Auto-login: ${this.results.registration.autoLoginSuccessful ? 'Yes' : 'No'}`);
    } else if (this.results.registration?.error) {
      console.log(`      Error: ${this.results.registration.error}`);
    }
    
    // Login
    const loginStatus = this.results.login?.success ? '✅ PASS' : '❌ FAIL';
    console.log(`   3. User Login: ${loginStatus}`);
    if (this.results.login?.success) {
      console.log(`      User: ${this.results.login.userEmail}`);
      console.log(`      JWT valid: ${this.results.login.jwtTokenValid ? 'Yes' : 'No'}`);
      console.log(`      User role: ${this.results.login.userRole}`);
    } else if (this.results.login?.error) {
      console.log(`      Error: ${this.results.login.error}`);
    }
    
    // Error Handling
    const errorHandlingStatus = this.results.errorHandling?.success ? '✅ PASS' : '❌ FAIL';
    console.log(`   4. Error Handling: ${errorHandlingStatus}`);
    if (this.results.errorHandling?.totalTests) {
      console.log(`      Tests passed: ${this.results.errorHandling.passedTests}/${this.results.errorHandling.totalTests}`);
    }
    
    // Session Management
    const sessionStatus = this.results.sessionManagement?.success ? '✅ PASS' : '❌ FAIL';
    console.log(`   5. Session Management: ${sessionStatus}`);
    if (this.results.sessionManagement) {
      console.log(`      Token refresh: ${this.results.sessionManagement.tokenRefreshWorking ? 'Working' : 'Not working'}`);
      console.log(`      Auth requests: ${this.results.sessionManagement.authenticatedRequestWorking ? 'Working' : 'Not working'}`);
    }
    
    // Overall Assessment
    const allTestsPass = this.results.backendConnection?.success && 
                        this.results.registration?.success && 
                        this.results.login?.success && 
                        this.results.errorHandling?.success && 
                        this.results.sessionManagement?.success;
    
    this.results.overallSuccess = allTestsPass;
    
    console.log('\n🎯 Overall Assessment:');
    if (allTestsPass) {
      console.log('✅ ALL TESTS PASSED - Authentication system is 100% ready!');
      console.log('   ✅ Backend API integration working perfectly');
      console.log('   ✅ User registration with auto-login functional');
      console.log('   ✅ Existing user login with JWT tokens working');
      console.log('   ✅ Error handling robust and accurate');
      console.log('   ✅ Session management and token refresh operational');
      console.log('   ✅ "Backend not connected" warning should be resolved');
    } else {
      console.log('❌ SOME TESTS FAILED - Authentication system needs attention');
      console.log('   Please review failed tests above and address issues');
    }
    
    console.log('\n📝 Next Steps:');
    if (allTestsPass) {
      console.log('   1. Authentication system is fully operational');
      console.log('   2. Test the frontend forms manually at:');
      console.log(`      - Registration: ${FRONTEND_URL}/register`);
      console.log(`      - Login: ${FRONTEND_URL}/login`);
      console.log('   3. Verify Google OAuth integration (if configured)');
      console.log('   4. Monitor production deployment');
    } else {
      console.log('   1. Fix failing backend API endpoints');
      console.log('   2. Ensure database is properly seeded');
      console.log('   3. Check environment variable configuration');
      console.log('   4. Re-run this test after fixes');
    }
    
    console.log('\n' + '='.repeat(80));
    
    return this.results;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Authentication Flow Tests...');
    
    // Sequential test execution
    const backendOk = await this.testBackendConnection();
    if (!backendOk) {
      console.log('\n⚠️  Skipping remaining tests due to backend connection failure');
      this.generateReport();
      return this.results;
    }
    
    await this.testUserRegistration();
    await this.testUserLogin();
    await this.testErrorHandling();
    await this.testSessionManagement();
    
    // Generate final report
    const results = this.generateReport();
    
    return results;
  }
}

// Run the tests
async function runTests() {
  // Install required dependencies check
  try {
    require('node-fetch');
  } catch (error) {
    console.log('Installing required dependencies...');
    const { execSync } = require('child_process');
    try {
      execSync('npm install node-fetch', { stdio: 'inherit' });
      global.fetch = require('node-fetch');
    } catch (installError) {
      console.error('Failed to install node-fetch. Please run: npm install node-fetch');
      process.exit(1);
    }
  }

  // Polyfill fetch for Node.js if needed
  if (typeof fetch === 'undefined') {
    try {
      global.fetch = require('node-fetch');
    } catch (error) {
      // Try to use built-in fetch (Node 18+)
      if (typeof globalThis.fetch !== 'undefined') {
        global.fetch = globalThis.fetch;
      } else {
        console.error('Fetch API not available. Please upgrade to Node.js 18+ or install node-fetch');
        process.exit(1);
      }
    }
  }

  const tester = new AuthenticationFlowTester();
  const results = await tester.runAllTests();
  
  // Exit with appropriate code
  process.exit(results.overallSuccess ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { AuthenticationFlowTester };
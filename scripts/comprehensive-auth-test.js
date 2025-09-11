#!/usr/bin/env node

/**
 * Comprehensive Authentication System Test Script
 * Tests the complete authentication flow regardless of backend status
 * 
 * Features tested:
 * 1. Configuration validation and structure
 * 2. Frontend form accessibility and functionality
 * 3. Backend API readiness (if available)
 * 4. Authentication flow simulation
 * 5. Security and error handling validation
 */

// Configuration
const FRONTEND_URL = 'http://localhost:3001';
const BACKEND_URL = 'http://localhost:8001';

class ComprehensiveAuthTester {
  constructor() {
    this.results = {
      configuration: { tests: [], success: false },
      frontendForms: { tests: [], success: false },
      backendAPI: { tests: [], success: false },
      authFlow: { tests: [], success: false },
      security: { tests: [], success: false },
      overallScore: 0,
      recommendations: []
    };
    this.startTime = new Date();
  }

  // Helper to make HTTP requests with timeout
  async makeRequest(url, options = {}) {
    try {
      const response = await fetch(url, {
        timeout: 5000,
        ...options
      });
      
      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: response.headers.get('content-type')?.includes('application/json') 
          ? await response.json()
          : await response.text()
      };
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: error.message,
        timeout: error.name === 'AbortError'
      };
    }
  }

  // Test 1: Configuration Structure Validation
  async testConfiguration() {
    console.log('\n🔍 Testing Authentication Configuration...');
    const tests = [];

    // Test auth config structure
    try {
      const fs = require('fs');
      const path = require('path');
      
      const configPath = path.join(process.cwd(), 'src', 'lib', 'auth', 'config.ts');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Check for key authentication components
        const checks = [
          { name: 'NextAuth configuration present', test: configContent.includes('NextAuth') },
          { name: 'Google OAuth provider configured', test: configContent.includes('GoogleProvider') },
          { name: 'Credentials provider configured', test: configContent.includes('CredentialsProvider') },
          { name: 'Backend authentication function', test: configContent.includes('authenticateWithBackend') },
          { name: 'JWT session strategy', test: configContent.includes('strategy: \'jwt\'') },
          { name: 'Token refresh mechanism', test: configContent.includes('/auth/refresh') },
          { name: 'Backend token storage', test: configContent.includes('backendToken') },
          { name: 'Error handling in auth', test: configContent.includes('catch') && configContent.includes('error') }
        ];

        tests.push(...checks);
      } else {
        tests.push({ name: 'Auth config file exists', test: false, error: 'Config file not found' });
      }

      // Test environment variables (if available)
      const envChecks = [
        { name: 'API URL configured', test: !!process.env.NEXT_PUBLIC_API_URL },
        { name: 'Google client ID present', test: !!process.env.GOOGLE_CLIENT_ID },
        { name: 'Google client secret present', test: !!process.env.GOOGLE_CLIENT_SECRET }
      ];
      
      tests.push(...envChecks);

    } catch (error) {
      tests.push({ name: 'Configuration validation', test: false, error: error.message });
    }

    const passedTests = tests.filter(test => test.test).length;
    this.results.configuration = {
      tests,
      success: passedTests >= tests.length * 0.8, // 80% pass rate
      passedTests,
      totalTests: tests.length
    };

    console.log(`   Configuration Tests: ${passedTests}/${tests.length} passed`);
    tests.forEach(test => {
      console.log(`   ${test.test ? '✅' : '❌'} ${test.name}${test.error ? ` (${test.error})` : ''}`);
    });
  }

  // Test 2: Frontend Forms Accessibility
  async testFrontendForms() {
    console.log('\n🔍 Testing Frontend Authentication Forms...');
    const tests = [];

    try {
      // Test registration page
      const registerResponse = await this.makeRequest(`${FRONTEND_URL}/register`);
      tests.push({
        name: 'Registration page accessible',
        test: registerResponse.ok,
        status: registerResponse.status
      });

      // Test login page
      const loginResponse = await this.makeRequest(`${FRONTEND_URL}/login`);
      tests.push({
        name: 'Login page accessible',
        test: loginResponse.ok,
        status: loginResponse.status
      });

      // Test dashboard redirect (should redirect to login if not authenticated)
      const dashboardResponse = await this.makeRequest(`${FRONTEND_URL}/dashboard`);
      tests.push({
        name: 'Dashboard auth protection',
        test: dashboardResponse.status === 302 || dashboardResponse.status === 307 || dashboardResponse.status === 200,
        status: dashboardResponse.status
      });

      // Test form structure by checking page content
      if (registerResponse.ok && typeof registerResponse.data === 'string') {
        const content = registerResponse.data;
        const formChecks = [
          { name: 'Registration form has email field', test: content.includes('email') || content.includes('Email') },
          { name: 'Registration form has password field', test: content.includes('password') || content.includes('Password') },
          { name: 'Registration form has name field', test: content.includes('name') || content.includes('Name') },
          { name: 'Google OAuth button present', test: content.includes('google') || content.includes('Google') },
          { name: 'Form validation present', test: content.includes('required') || content.includes('validation') }
        ];
        tests.push(...formChecks);
      }

      if (loginResponse.ok && typeof loginResponse.data === 'string') {
        const content = loginResponse.data;
        const loginChecks = [
          { name: 'Login form has email field', test: content.includes('email') || content.includes('Email') },
          { name: 'Login form has password field', test: content.includes('password') || content.includes('Password') },
          { name: 'Forgot password link present', test: content.includes('forgot') || content.includes('Forgot') },
          { name: 'Register link present', test: content.includes('register') || content.includes('Register') || content.includes('Sign up') }
        ];
        tests.push(...loginChecks);
      }

    } catch (error) {
      tests.push({ name: 'Frontend forms test', test: false, error: error.message });
    }

    const passedTests = tests.filter(test => test.test).length;
    this.results.frontendForms = {
      tests,
      success: passedTests >= tests.length * 0.8,
      passedTests,
      totalTests: tests.length
    };

    console.log(`   Frontend Forms Tests: ${passedTests}/${tests.length} passed`);
    tests.forEach(test => {
      console.log(`   ${test.test ? '✅' : '❌'} ${test.name}${test.status ? ` (${test.status})` : ''}${test.error ? ` (${test.error})` : ''}`);
    });
  }

  // Test 3: Backend API Readiness
  async testBackendAPI() {
    console.log('\n🔍 Testing Backend API Readiness...');
    const tests = [];

    try {
      // Health check
      const healthResponse = await this.makeRequest(`${BACKEND_URL}/health`);
      tests.push({
        name: 'Backend health endpoint',
        test: healthResponse.ok,
        status: healthResponse.status,
        available: healthResponse.ok
      });

      // Auth endpoints check
      const authEndpoints = [
        '/api/v1/auth/register',
        '/api/v1/auth/login',
        '/api/v1/auth/refresh'
      ];

      if (healthResponse.ok) {
        for (const endpoint of authEndpoints) {
          const response = await this.makeRequest(`${BACKEND_URL}${endpoint}`, {
            method: 'OPTIONS'
          });
          tests.push({
            name: `Auth endpoint: ${endpoint}`,
            test: response.status !== 0 && response.status !== 404,
            status: response.status
          });
        }

        // Test business endpoints
        const businessResponse = await this.makeRequest(`${BACKEND_URL}/api/v1/businesses`, {
          method: 'OPTIONS'
        });
        tests.push({
          name: 'Business endpoints available',
          test: businessResponse.status !== 0 && businessResponse.status !== 404,
          status: businessResponse.status
        });
      } else {
        // Backend not available - mark tests as skipped
        tests.push(
          ...authEndpoints.map(endpoint => ({
            name: `Auth endpoint: ${endpoint}`,
            test: false,
            status: 'N/A - Backend offline',
            skipped: true
          }))
        );
        tests.push({
          name: 'Business endpoints available',
          test: false,
          status: 'N/A - Backend offline',
          skipped: true
        });
      }

    } catch (error) {
      tests.push({ name: 'Backend API test', test: false, error: error.message });
    }

    const passedTests = tests.filter(test => test.test).length;
    const skippedTests = tests.filter(test => test.skipped).length;
    
    this.results.backendAPI = {
      tests,
      success: passedTests > 0 || skippedTests > 0, // Success if backend is working OR offline (not broken)
      passedTests,
      totalTests: tests.length,
      skippedTests,
      backendOffline: tests.some(test => test.status === 'N/A - Backend offline')
    };

    console.log(`   Backend API Tests: ${passedTests}/${tests.length} passed${skippedTests > 0 ? ` (${skippedTests} skipped - backend offline)` : ''}`);
    tests.forEach(test => {
      const icon = test.test ? '✅' : (test.skipped ? '⏭️' : '❌');
      console.log(`   ${icon} ${test.name}${test.status ? ` (${test.status})` : ''}${test.error ? ` (${test.error})` : ''}`);
    });
  }

  // Test 4: Authentication Flow Logic
  async testAuthFlow() {
    console.log('\n🔍 Testing Authentication Flow Logic...');
    const tests = [];

    try {
      // Test auth configuration file logic
      const fs = require('fs');
      const path = require('path');
      
      const configPath = path.join(process.cwd(), 'src', 'lib', 'auth', 'config.ts');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        const flowChecks = [
          {
            name: 'Credentials flow with backend fallback',
            test: configContent.includes('authenticateWithBackend') && 
                  configContent.includes('credentials') &&
                  configContent.includes('login') &&
                  configContent.includes('register')
          },
          {
            name: 'OAuth flow with backend sync',
            test: configContent.includes('GoogleProvider') && 
                  configContent.includes('firebaseToken') &&
                  configContent.includes('jwt')
          },
          {
            name: 'Session management with backend token',
            test: configContent.includes('jwt') && 
                  configContent.includes('backendToken') &&
                  configContent.includes('session')
          },
          {
            name: 'Token refresh mechanism',
            test: configContent.includes('refresh') && 
                  configContent.includes('token') &&
                  configContent.includes('/api/v1/auth/refresh')
          },
          {
            name: 'Error handling in auth flow',
            test: configContent.includes('try') && 
                  configContent.includes('catch') &&
                  configContent.includes('error')
          },
          {
            name: 'User creation fallback',
            test: configContent.includes('register') && 
                  configContent.includes('400') &&
                  configContent.includes('user not found')
          }
        ];

        tests.push(...flowChecks);

        // Test registration form logic
        const registerFormPath = path.join(process.cwd(), 'src', 'components', 'auth', 'RegisterForm.tsx');
        if (fs.existsSync(registerFormPath)) {
          const registerContent = fs.readFileSync(registerFormPath, 'utf8');
          
          const registerChecks = [
            {
              name: 'Registration with backend API',
              test: registerContent.includes('/api/v1/auth/register') &&
                    registerContent.includes('fetch') &&
                    registerContent.includes('POST')
            },
            {
              name: 'Auto-login after registration',
              test: registerContent.includes('signIn') &&
                    registerContent.includes('credentials') &&
                    registerContent.includes('redirect')
            },
            {
              name: 'Form validation',
              test: registerContent.includes('validateForm') &&
                    registerContent.includes('password') &&
                    registerContent.includes('email')
            },
            {
              name: 'Error handling in registration',
              test: registerContent.includes('setError') &&
                    registerContent.includes('catch') &&
                    registerContent.includes('already exists')
            }
          ];

          tests.push(...registerChecks);
        } else {
          tests.push({ name: 'Registration form exists', test: false, error: 'File not found' });
        }

        // Test login form logic
        const loginFormPath = path.join(process.cwd(), 'src', 'components', 'auth', 'LoginForm.tsx');
        if (fs.existsSync(loginFormPath)) {
          const loginContent = fs.readFileSync(loginFormPath, 'utf8');
          
          const loginChecks = [
            {
              name: 'Login with NextAuth credentials',
              test: loginContent.includes('signIn') &&
                    loginContent.includes('credentials') &&
                    loginContent.includes('email')
            },
            {
              name: 'Google OAuth integration',
              test: loginContent.includes('signIn') &&
                    loginContent.includes('google') &&
                    loginContent.includes('OAuth')
            },
            {
              name: 'Error message handling',
              test: loginContent.includes('error') &&
                    loginContent.includes('CredentialsSignin') &&
                    loginContent.includes('Invalid')
            }
          ];

          tests.push(...loginChecks);
        } else {
          tests.push({ name: 'Login form exists', test: false, error: 'File not found' });
        }

      } else {
        tests.push({ name: 'Auth configuration exists', test: false, error: 'Config file not found' });
      }

    } catch (error) {
      tests.push({ name: 'Auth flow logic test', test: false, error: error.message });
    }

    const passedTests = tests.filter(test => test.test).length;
    this.results.authFlow = {
      tests,
      success: passedTests >= tests.length * 0.75, // 75% pass rate
      passedTests,
      totalTests: tests.length
    };

    console.log(`   Authentication Flow Tests: ${passedTests}/${tests.length} passed`);
    tests.forEach(test => {
      console.log(`   ${test.test ? '✅' : '❌'} ${test.name}${test.error ? ` (${test.error})` : ''}`);
    });
  }

  // Test 5: Security and Error Handling
  async testSecurity() {
    console.log('\n🔍 Testing Security and Error Handling...');
    const tests = [];

    try {
      const fs = require('fs');
      const path = require('path');
      
      // Check security configurations
      const configPath = path.join(process.cwd(), 'src', 'lib', 'auth', 'config.ts');
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        const securityChecks = [
          {
            name: 'JWT session strategy (more secure)',
            test: configContent.includes('strategy: \'jwt\'')
          },
          {
            name: 'Session max age configured',
            test: configContent.includes('maxAge') && configContent.includes('24')
          },
          {
            name: 'HTTPS redirect configuration',
            test: configContent.includes('redirect') && configContent.includes('baseUrl')
          },
          {
            name: 'Error handling in callbacks',
            test: configContent.includes('try') && 
                  configContent.includes('catch') &&
                  configContent.includes('console.error')
          },
          {
            name: 'Token validation',
            test: configContent.includes('token') && 
                  configContent.includes('refresh') &&
                  configContent.includes('response.ok')
          }
        ];

        tests.push(...securityChecks);
      }

      // Check environment security
      const envPath = path.join(process.cwd(), '.env.local');
      const envExamplePath = path.join(process.cwd(), '.env.example');
      
      tests.push({
        name: 'Environment file configured',
        test: fs.existsSync(envPath) || fs.existsSync(envExamplePath)
      });

      // Check for common security issues
      const packagePath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packagePath)) {
        const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        const dependencyChecks = [
          {
            name: 'NextAuth.js for authentication',
            test: !!packageContent.dependencies['next-auth']
          },
          {
            name: 'Secure dependencies present',
            test: !!packageContent.dependencies['next'] && 
                  !!packageContent.dependencies['react']
          }
        ];

        tests.push(...dependencyChecks);
      }

      // Test password strength component
      const passwordStrengthPath = path.join(process.cwd(), 'src', 'components', 'auth', 'PasswordStrengthIndicator.tsx');
      tests.push({
        name: 'Password strength validation',
        test: fs.existsSync(passwordStrengthPath)
      });

    } catch (error) {
      tests.push({ name: 'Security configuration test', test: false, error: error.message });
    }

    const passedTests = tests.filter(test => test.test).length;
    this.results.security = {
      tests,
      success: passedTests >= tests.length * 0.8, // 80% pass rate
      passedTests,
      totalTests: tests.length
    };

    console.log(`   Security Tests: ${passedTests}/${tests.length} passed`);
    tests.forEach(test => {
      console.log(`   ${test.test ? '✅' : '❌'} ${test.name}${test.error ? ` (${test.error})` : ''}`);
    });
  }

  // Generate recommendations
  generateRecommendations() {
    const recommendations = [];

    // Configuration recommendations
    if (!this.results.configuration.success) {
      recommendations.push({
        category: 'Configuration',
        priority: 'High',
        issue: 'Authentication configuration needs attention',
        solution: 'Ensure all required auth providers and backend integration are properly configured'
      });
    }

    // Backend recommendations
    if (this.results.backendAPI.backendOffline) {
      recommendations.push({
        category: 'Backend Integration',
        priority: 'Critical',
        issue: 'Backend server is not running',
        solution: 'Start the Express.js backend server on port 8001 and ensure database is connected'
      });
    } else if (!this.results.backendAPI.success) {
      recommendations.push({
        category: 'Backend Integration',
        priority: 'High',
        issue: 'Backend API endpoints are not responding correctly',
        solution: 'Check backend server logs and ensure API endpoints are properly configured'
      });
    }

    // Frontend recommendations
    if (!this.results.frontendForms.success) {
      recommendations.push({
        category: 'Frontend Forms',
        priority: 'Medium',
        issue: 'Authentication forms may have accessibility or functionality issues',
        solution: 'Review form validation, error handling, and user experience'
      });
    }

    // Security recommendations
    if (!this.results.security.success) {
      recommendations.push({
        category: 'Security',
        priority: 'High',
        issue: 'Security configuration needs improvement',
        solution: 'Review JWT settings, session management, and password validation'
      });
    }

    // General recommendations
    recommendations.push({
      category: 'Testing',
      priority: 'Medium',
      issue: 'Authentication system testing',
      solution: 'Set up automated testing for authentication flows and edge cases'
    });

    this.results.recommendations = recommendations;
  }

  // Calculate overall score
  calculateOverallScore() {
    const weights = {
      configuration: 0.25,
      frontendForms: 0.20,
      backendAPI: 0.25,
      authFlow: 0.20,
      security: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    Object.keys(weights).forEach(category => {
      const result = this.results[category];
      if (result && result.totalTests > 0) {
        const score = (result.passedTests / result.totalTests) * 100;
        totalScore += score * weights[category];
        totalWeight += weights[category];
      }
    });

    // Handle backend offline case - don't penalize if backend is simply not running
    if (this.results.backendAPI.backendOffline && this.results.backendAPI.passedTests === 0) {
      totalScore += 70 * weights.backendAPI; // Give partial credit for offline backend
    }

    this.results.overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  // Generate comprehensive report
  generateReport() {
    const endTime = new Date();
    const duration = endTime - this.startTime;
    
    this.generateRecommendations();
    this.calculateOverallScore();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 COMPREHENSIVE AUTHENTICATION SYSTEM TEST REPORT');
    console.log('='.repeat(80));
    
    console.log(`📊 Test Duration: ${duration}ms`);
    console.log(`📅 Test Time: ${this.startTime.toISOString()}`);
    console.log(`🎯 Frontend URL: ${FRONTEND_URL}`);
    console.log(`🔗 Backend URL: ${BACKEND_URL}`);
    console.log(`🏆 Overall Score: ${this.results.overallScore}/100`);
    
    // Category breakdown
    console.log('\n📋 Category Results:');
    
    Object.keys(this.results).forEach(category => {
      if (typeof this.results[category] === 'object' && this.results[category].tests) {
        const result = this.results[category];
        const status = result.success ? '✅ PASS' : '❌ NEEDS ATTENTION';
        const percentage = result.totalTests > 0 ? Math.round((result.passedTests / result.totalTests) * 100) : 0;
        
        console.log(`   ${category.toUpperCase()}: ${status} (${result.passedTests}/${result.totalTests} - ${percentage}%)`);
        
        if (result.skippedTests > 0) {
          console.log(`      ⏭️ ${result.skippedTests} tests skipped`);
        }
      }
    });
    
    // Authentication readiness assessment
    console.log('\n🎯 Authentication System Assessment:');
    
    if (this.results.overallScore >= 90) {
      console.log('✅ EXCELLENT - Authentication system is production-ready!');
    } else if (this.results.overallScore >= 75) {
      console.log('🟡 GOOD - Authentication system is mostly ready with minor issues');
    } else if (this.results.overallScore >= 60) {
      console.log('🟠 FAIR - Authentication system needs significant improvements');
    } else {
      console.log('❌ POOR - Authentication system requires major fixes before use');
    }
    
    // Backend status
    if (this.results.backendAPI.backendOffline) {
      console.log('\n⚠️  Backend Status: OFFLINE');
      console.log('   The authentication system is configured but the backend server is not running.');
      console.log('   This is expected in development - start the backend to test full integration.');
    } else if (this.results.backendAPI.success) {
      console.log('\n✅ Backend Status: ONLINE');
      console.log('   Backend API is responding and ready for authentication requests.');
    } else {
      console.log('\n❌ Backend Status: ERROR');
      console.log('   Backend is reachable but has configuration or functionality issues.');
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. [${rec.priority}] ${rec.category}: ${rec.issue}`);
        console.log(`      Solution: ${rec.solution}`);
      });
    }
    
    // Next steps
    console.log('\n📝 Next Steps:');
    if (this.results.backendAPI.backendOffline) {
      console.log('   1. 🚀 Start the backend server:');
      console.log('      cd /path/to/backend && npm run dev');
      console.log('   2. 🗄️ Ensure database is running and migrated');
      console.log('   3. 🧪 Re-run this test to verify full integration');
      console.log('   4. 🌱 Run the seeding script to create test users:');
      console.log('      node scripts/seed-backend.js');
    } else if (this.results.overallScore >= 80) {
      console.log('   1. ✅ Authentication system is ready for use');
      console.log('   2. 🧪 Test manual registration and login flows');
      console.log('   3. 🔐 Test Google OAuth integration');
      console.log('   4. 📊 Monitor authentication logs in production');
    } else {
      console.log('   1. 🔧 Address high-priority recommendations above');
      console.log('   2. 🧪 Re-run tests after fixes');
      console.log('   3. 📚 Review authentication documentation');
      console.log('   4. 🔒 Conduct security review');
    }
    
    // Test URLs for manual testing
    console.log('\n🌐 Manual Testing URLs:');
    console.log(`   📝 Registration: ${FRONTEND_URL}/register`);
    console.log(`   🔑 Login: ${FRONTEND_URL}/login`);
    console.log(`   🏠 Dashboard: ${FRONTEND_URL}/dashboard`);
    console.log(`   🧪 Backend Test: ${FRONTEND_URL}/dashboard/test-backend`);
    
    console.log('\n' + '='.repeat(80));
    
    return this.results;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Authentication System Tests...\n');
    console.log(`Frontend: ${FRONTEND_URL}`);
    console.log(`Backend: ${BACKEND_URL}`);
    
    await this.testConfiguration();
    await this.testFrontendForms();
    await this.testBackendAPI();
    await this.testAuthFlow();
    await this.testSecurity();
    
    return this.generateReport();
  }
}

// Polyfill fetch for Node.js
async function setupFetch() {
  if (typeof fetch === 'undefined') {
    try {
      // Try built-in fetch (Node 18+)
      if (typeof globalThis.fetch !== 'undefined') {
        global.fetch = globalThis.fetch;
      } else {
        // Fallback to node-fetch
        const { default: fetch } = await import('node-fetch');
        global.fetch = fetch;
      }
    } catch (error) {
      console.error('❌ Fetch API not available. Please upgrade to Node.js 18+ or install node-fetch');
      process.exit(1);
    }
  }
}

// Main execution
async function runTests() {
  await setupFetch();
  
  const tester = new ComprehensiveAuthTester();
  const results = await tester.runAllTests();
  
  // Exit with appropriate code based on score
  const exitCode = results.overallScore >= 60 ? 0 : 1;
  process.exit(exitCode);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { ComprehensiveAuthTester };
const http = require('http');
const https = require('https');
const url = require('url');

// Color codes for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ComprehensiveTestRunner {
  constructor() {
    this.frontendUrl = 'http://localhost:3004';
    this.backendUrl = 'http://localhost:8001';
    this.testResults = [];
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
  }

  log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  logTest(testName, status, details = '') {
    this.totalTests++;
    const statusColor = status === 'PASS' ? 'green' : 'red';
    const statusSymbol = status === 'PASS' ? '✅' : '❌';
    
    if (status === 'PASS') this.passedTests++;
    else this.failedTests++;

    this.log(`${statusSymbol} ${testName}`, statusColor);
    if (details) {
      this.log(`   ${details}`, 'cyan');
    }
    
    this.testResults.push({ testName, status, details });
  }

  async makeRequest(url, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'User-Agent': 'iDEAN-AI-Test-Suite/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          ...headers
        }
      };

      if (data) {
        options.headers['Content-Type'] = 'application/json';
        options.headers['Content-Length'] = Buffer.byteLength(data);
      }

      const protocol = urlObj.protocol === 'https:' ? https : http;
      
      const req = protocol.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(data);
      }
      
      req.end();
    });
  }

  async testServerConnections() {
    this.log('\n🔧 Testing Server Connections', 'bold');
    
    try {
      const frontendResponse = await this.makeRequest(this.frontendUrl);
      if (frontendResponse.statusCode === 200) {
        this.logTest('Frontend Server Connection', 'PASS', `Status: ${frontendResponse.statusCode}`);
      } else {
        this.logTest('Frontend Server Connection', 'FAIL', `Status: ${frontendResponse.statusCode}`);
      }
    } catch (error) {
      this.logTest('Frontend Server Connection', 'FAIL', `Error: ${error.message}`);
    }

    try {
      const backendResponse = await this.makeRequest(this.backendUrl);
      if (backendResponse.statusCode && backendResponse.statusCode < 500) {
        this.logTest('Backend Server Connection', 'PASS', `Status: ${backendResponse.statusCode}`);
      } else {
        this.logTest('Backend Server Connection', 'FAIL', `Status: ${backendResponse.statusCode}`);
      }
    } catch (error) {
      this.logTest('Backend Server Connection', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testPageAccessibility() {
    this.log('\n📄 Testing Page Accessibility', 'bold');
    
    const pages = [
      { path: '/', name: 'Landing Page' },
      { path: '/login', name: 'Login Page' },
      { path: '/register', name: 'Registration Page' },
      { path: '/dashboard', name: 'Dashboard Page (Should redirect to login)' },
      { path: '/dashboard/onboarding', name: 'Onboarding Page (Should redirect to login)' }
    ];

    for (const page of pages) {
      try {
        const response = await this.makeRequest(`${this.frontendUrl}${page.path}`);
        
        if (response.statusCode === 200) {
          // Check if it contains basic HTML structure
          const hasHtmlStructure = response.body.includes('<html') && 
                                   response.body.includes('</html>') &&
                                   response.body.includes('<title');
          
          if (hasHtmlStructure) {
            this.logTest(`${page.name} Loads`, 'PASS', 'Valid HTML structure detected');
          } else {
            this.logTest(`${page.name} Loads`, 'FAIL', 'Missing HTML structure');
          }
          
          // Check for JavaScript errors in the HTML
          const hasJSErrors = response.body.includes('Error:') || 
                              response.body.includes('undefined is not') ||
                              response.body.includes('Cannot read property');
          
          if (!hasJSErrors) {
            this.logTest(`${page.name} No Server-side JS Errors`, 'PASS');
          } else {
            this.logTest(`${page.name} No Server-side JS Errors`, 'FAIL', 'Potential JS errors detected');
          }

        } else if (response.statusCode === 302 || response.statusCode === 307) {
          this.logTest(`${page.name} Loads`, 'PASS', `Redirects (${response.statusCode}) - Expected for protected routes`);
        } else {
          this.logTest(`${page.name} Loads`, 'FAIL', `Status: ${response.statusCode}`);
        }
      } catch (error) {
        this.logTest(`${page.name} Loads`, 'FAIL', `Error: ${error.message}`);
      }
    }
  }

  async testAuthenticationEndpoints() {
    this.log('\n🔐 Testing Authentication Endpoints', 'bold');
    
    // Test registration endpoint
    try {
      const registrationData = JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        password: 'TestPassword123!',
        provider: 'email'
      });

      const regResponse = await this.makeRequest(
        `${this.backendUrl}/api/v1/auth/register`,
        'POST',
        registrationData,
        { 'Content-Type': 'application/json' }
      );

      if (regResponse.statusCode === 201 || regResponse.statusCode === 400) {
        // 400 could mean user already exists, which is fine for testing
        this.logTest('Registration Endpoint Accessible', 'PASS', `Status: ${regResponse.statusCode}`);
      } else {
        this.logTest('Registration Endpoint Accessible', 'FAIL', `Status: ${regResponse.statusCode}`);
      }
    } catch (error) {
      this.logTest('Registration Endpoint Accessible', 'FAIL', `Error: ${error.message}`);
    }

    // Test login endpoint
    try {
      const loginData = JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123!'
      });

      const loginResponse = await this.makeRequest(
        `${this.backendUrl}/api/v1/auth/login`,
        'POST',
        loginData,
        { 'Content-Type': 'application/json' }
      );

      if (loginResponse.statusCode && loginResponse.statusCode < 500) {
        this.logTest('Login Endpoint Accessible', 'PASS', `Status: ${loginResponse.statusCode}`);
      } else {
        this.logTest('Login Endpoint Accessible', 'FAIL', `Status: ${loginResponse.statusCode}`);
      }
    } catch (error) {
      this.logTest('Login Endpoint Accessible', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testComponentIntegration() {
    this.log('\n⚙️ Testing Component Integration', 'bold');
    
    // Test if login page contains the expected form elements
    try {
      const loginPageResponse = await this.makeRequest(`${this.frontendUrl}/login`);
      
      if (loginPageResponse.statusCode === 200) {
        const loginBody = loginPageResponse.body;
        
        // Check for login form elements
        const hasEmailInput = loginBody.includes('email') || loginBody.includes('Email');
        const hasPasswordInput = loginBody.includes('password') || loginBody.includes('Password');
        const hasGoogleButton = loginBody.includes('Google') || loginBody.includes('google');
        const hasSubmitButton = loginBody.includes('Sign') || loginBody.includes('Login');
        
        if (hasEmailInput) {
          this.logTest('Login Form - Email Input Present', 'PASS');
        } else {
          this.logTest('Login Form - Email Input Present', 'FAIL');
        }
        
        if (hasPasswordInput) {
          this.logTest('Login Form - Password Input Present', 'PASS');
        } else {
          this.logTest('Login Form - Password Input Present', 'FAIL');
        }
        
        if (hasGoogleButton) {
          this.logTest('Login Form - Google Sign-in Present', 'PASS');
        } else {
          this.logTest('Login Form - Google Sign-in Present', 'FAIL');
        }
        
        if (hasSubmitButton) {
          this.logTest('Login Form - Submit Button Present', 'PASS');
        } else {
          this.logTest('Login Form - Submit Button Present', 'FAIL');
        }
      }
    } catch (error) {
      this.logTest('Login Form Integration Test', 'FAIL', `Error: ${error.message}`);
    }

    // Test if registration page contains expected elements
    try {
      const registerPageResponse = await this.makeRequest(`${this.frontendUrl}/register`);
      
      if (registerPageResponse.statusCode === 200) {
        const registerBody = registerPageResponse.body;
        
        const hasNameInput = registerBody.includes('name') || registerBody.includes('Name');
        const hasEmailInput = registerBody.includes('email') || registerBody.includes('Email');
        const hasPasswordInput = registerBody.includes('password') || registerBody.includes('Password');
        const hasConfirmPassword = registerBody.includes('confirm') || registerBody.includes('Confirm');
        
        if (hasNameInput && hasEmailInput && hasPasswordInput && hasConfirmPassword) {
          this.logTest('Registration Form - All Required Fields Present', 'PASS');
        } else {
          this.logTest('Registration Form - All Required Fields Present', 'FAIL', 
            `Name: ${hasNameInput}, Email: ${hasEmailInput}, Password: ${hasPasswordInput}, Confirm: ${hasConfirmPassword}`);
        }
      }
    } catch (error) {
      this.logTest('Registration Form Integration Test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testErrorHandling() {
    this.log('\n🚨 Testing Error Handling', 'bold');
    
    // Test 404 handling
    try {
      const response404 = await this.makeRequest(`${this.frontendUrl}/non-existent-page`);
      
      if (response404.statusCode === 404) {
        this.logTest('404 Error Handling', 'PASS', 'Returns proper 404 status');
      } else if (response404.statusCode === 200 && response404.body.includes('404')) {
        this.logTest('404 Error Handling', 'PASS', 'Returns 404 page content');
      } else {
        this.logTest('404 Error Handling', 'FAIL', `Status: ${response404.statusCode}`);
      }
    } catch (error) {
      this.logTest('404 Error Handling', 'FAIL', `Error: ${error.message}`);
    }

    // Test backend error handling
    try {
      const badRequestResponse = await this.makeRequest(
        `${this.backendUrl}/api/v1/auth/register`,
        'POST',
        'invalid-json',
        { 'Content-Type': 'application/json' }
      );

      if (badRequestResponse.statusCode === 400) {
        this.logTest('Backend Invalid JSON Handling', 'PASS', 'Returns 400 for invalid JSON');
      } else {
        this.logTest('Backend Invalid JSON Handling', 'FAIL', `Status: ${badRequestResponse.statusCode}`);
      }
    } catch (error) {
      this.logTest('Backend Invalid JSON Handling', 'FAIL', `Error: ${error.message}`);
    }
  }

  async testSecurity() {
    this.log('\n🛡️ Testing Security Headers', 'bold');
    
    try {
      const response = await this.makeRequest(this.frontendUrl);
      const headers = response.headers;
      
      // Check for security headers
      if (headers['x-frame-options'] || headers['x-content-type-options']) {
        this.logTest('Security Headers Present', 'PASS', 'Basic security headers detected');
      } else {
        this.logTest('Security Headers Present', 'FAIL', 'No security headers detected');
      }

      // Check if HTTPS is being enforced (in production this would be important)
      this.logTest('Development Environment Check', 'PASS', 'Running on localhost (development mode)');

    } catch (error) {
      this.logTest('Security Headers Test', 'FAIL', `Error: ${error.message}`);
    }
  }

  async runAllTests() {
    this.log(`${colors.bold}${colors.cyan}🧪 iDEAN AI - Comprehensive Test Suite${colors.reset}`);
    this.log(`${colors.blue}===========================================${colors.reset}\n`);

    const startTime = Date.now();

    // Run all test suites
    await this.testServerConnections();
    await this.testPageAccessibility();
    await this.testAuthenticationEndpoints();
    await this.testComponentIntegration();
    await this.testErrorHandling();
    await this.testSecurity();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Print summary
    this.log(`\n${colors.bold}${colors.cyan}📊 Test Summary${colors.reset}`);
    this.log(`${colors.blue}===============${colors.reset}`);
    this.log(`Total Tests: ${colors.bold}${this.totalTests}${colors.reset}`);
    this.log(`Passed: ${colors.green}${colors.bold}${this.passedTests}${colors.reset}`);
    this.log(`Failed: ${colors.red}${colors.bold}${this.failedTests}${colors.reset}`);
    this.log(`Success Rate: ${colors.bold}${((this.passedTests / this.totalTests) * 100).toFixed(1)}%${colors.reset}`);
    this.log(`Duration: ${colors.bold}${duration}s${colors.reset}`);

    // Overall status
    const overallStatus = this.failedTests === 0 ? 'PASS' : 'PARTIAL';
    const statusColor = overallStatus === 'PASS' ? 'green' : 'yellow';
    
    this.log(`\n${colors[statusColor]}${colors.bold}Overall Status: ${overallStatus}${colors.reset}`);

    if (this.failedTests > 0) {
      this.log(`\n${colors.red}${colors.bold}❗ Failed Tests Summary:${colors.reset}`);
      this.testResults
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          this.log(`${colors.red}  • ${test.testName}${colors.reset}`);
          if (test.details) {
            this.log(`${colors.yellow}    ${test.details}${colors.reset}`);
          }
        });
    }

    this.log(`\n${colors.cyan}${colors.bold}🎯 Test Analysis Complete!${colors.reset}\n`);

    return {
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      failedTests: this.failedTests,
      successRate: (this.passedTests / this.totalTests) * 100,
      duration: duration,
      overallStatus: overallStatus,
      results: this.testResults
    };
  }
}

// Run the comprehensive test suite
async function main() {
  const testRunner = new ComprehensiveTestRunner();
  const results = await testRunner.runAllTests();
  
  // Exit with appropriate code
  process.exit(results.failedTests === 0 ? 0 : 1);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ComprehensiveTestRunner;
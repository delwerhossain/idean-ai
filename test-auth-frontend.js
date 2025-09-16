const { chromium } = require('playwright');

/**
 * Comprehensive Firebase Authentication Testing Script
 * Tests the full authentication flow for the iDEAN AI application
 */

async function runAuthenticationTests() {
  console.log('🚀 Starting Firebase Authentication Integration Tests');
  console.log('===============================================\n');

  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Slow down actions for better observation
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true
  });
  
  const page = await context.newPage();
  
  // Listen for console logs and errors
  const consoleLogs = [];
  const errors = [];
  
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    });
    console.log(`🖥️  [${msg.type().toUpperCase()}]: ${msg.text()}`);
  });
  
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    console.error(`❌ Page Error: ${error.message}`);
  });

  const testResults = {
    loginPageLoad: false,
    formValidation: false,
    googleButtonPresent: false,
    protectedRouteRedirect: false,
    authContextWorking: false,
    consoleErrors: [],
    recommendations: []
  };

  try {
    // Test 1: Login Page Load
    console.log('📋 Test 1: Loading Login Page...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    
    // Check if login page loaded successfully
    const loginTitle = await page.textContent('h1, h2, .card-title, [class*="title"]').catch(() => null);
    testResults.loginPageLoad = loginTitle && loginTitle.toLowerCase().includes('welcome');
    console.log(`   ✅ Login page loaded: ${testResults.loginPageLoad ? 'PASS' : 'FAIL'}`);
    
    // Test 2: Form Elements Present
    console.log('\n📋 Test 2: Checking Form Elements...');
    const emailInput = await page.locator('input[type="email"], input#email').first();
    const passwordInput = await page.locator('input[type="password"], input#password').first();
    const googleButton = await page.locator('button:has-text("Google"), button:has-text("google")').first();
    
    const emailExists = await emailInput.count() > 0;
    const passwordExists = await passwordInput.count() > 0;
    const googleExists = await googleButton.count() > 0;
    
    testResults.googleButtonPresent = googleExists;
    console.log(`   📧 Email input: ${emailExists ? 'PRESENT' : 'MISSING'}`);
    console.log(`   🔐 Password input: ${passwordExists ? 'PRESENT' : 'MISSING'}`);
    console.log(`   🔍 Google button: ${googleExists ? 'PRESENT' : 'MISSING'}`);

    // Test 3: Form Validation
    console.log('\n📋 Test 3: Testing Form Validation...');
    try {
      if (emailExists) {
        await emailInput.fill('invalid-email');
        await passwordInput.fill('123');
        
        // Try to submit form
        const submitButton = await page.locator('button[type="submit"], button:has-text("Sign In")').first();
        await submitButton.click();
        
        // Wait a moment and check for validation messages
        await page.waitForTimeout(2000);
        
        const validationMessages = await page.locator('.error, .text-red, [class*="error"]').allTextContents();
        testResults.formValidation = validationMessages.length > 0 || 
                                   await page.locator('input:invalid').count() > 0;
        
        console.log(`   ✅ Form validation working: ${testResults.formValidation ? 'PASS' : 'FAIL'}`);
        if (validationMessages.length > 0) {
          console.log(`   📝 Validation messages: ${validationMessages.join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`   ⚠️  Form validation test error: ${error.message}`);
    }

    // Test 4: Protected Route Redirect (Dashboard without auth)
    console.log('\n📋 Test 4: Testing Protected Route Redirect...');
    await page.goto('http://localhost:3001/dashboard', { waitUntil: 'networkidle' });
    
    await page.waitForTimeout(3000); // Wait for potential redirect
    const currentUrl = page.url();
    testResults.protectedRouteRedirect = currentUrl.includes('/login') || currentUrl.includes('/signin') || 
                                        currentUrl.includes('auth') || !currentUrl.includes('/dashboard');
    
    console.log(`   🔒 Protected route redirect: ${testResults.protectedRouteRedirect ? 'PASS' : 'FAIL'}`);
    console.log(`   🌐 Current URL: ${currentUrl}`);

    // Test 5: Check Authentication Context Loading
    console.log('\n📋 Test 5: Testing Auth Context...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    
    // Check if AuthContext is working by examining button states
    await page.waitForTimeout(2000);
    const loadingButtons = await page.locator('button:has-text("Loading"), button:has-text("loading")').count();
    const signInButtons = await page.locator('button:has-text("Sign In"), button:has-text("Google")').count();
    
    testResults.authContextWorking = signInButtons > 0;
    console.log(`   🔄 Auth context loading: ${testResults.authContextWorking ? 'PASS' : 'FAIL'}`);

    // Test 6: Navigation Tests
    console.log('\n📋 Test 6: Testing Navigation...');
    
    // Test register link
    const registerLink = await page.locator('a:has-text("Sign up"), a:has-text("Register")').first();
    if (await registerLink.count() > 0) {
      await registerLink.click();
      await page.waitForTimeout(2000);
      const registerPageUrl = page.url();
      console.log(`   📝 Register navigation: ${registerPageUrl.includes('register') ? 'PASS' : 'FAIL'}`);
      
      // Go back to login
      await page.goBack();
      await page.waitForTimeout(1000);
    }
    
    // Test forgot password link
    const forgotPasswordLink = await page.locator('a:has-text("Forgot"), a:has-text("forgot")').first();
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.click();
      await page.waitForTimeout(2000);
      const forgotPageUrl = page.url();
      console.log(`   🔑 Forgot password navigation: ${forgotPageUrl.includes('forgot') ? 'PASS' : 'FAIL'}`);
    }

    // Test 7: Firebase Configuration Check
    console.log('\n📋 Test 7: Checking Firebase Integration...');
    await page.goto('http://localhost:3001/login', { waitUntil: 'networkidle' });
    
    // Check if Firebase is loaded in the page
    const firebaseCheck = await page.evaluate(() => {
      return typeof window !== 'undefined' && 
             (window.firebase !== undefined || 
              document.querySelector('script[src*="firebase"]') !== null ||
              window.__FIREBASE_DEFAULTS__ !== undefined);
    });
    
    console.log(`   🔥 Firebase loaded: ${firebaseCheck ? 'PASS' : 'FAIL'}`);

    // Collect console errors
    testResults.consoleErrors = errors.concat(
      consoleLogs.filter(log => log.type === 'error').map(log => ({
        message: log.text,
        timestamp: log.timestamp
      }))
    );

  } catch (error) {
    console.error(`❌ Test execution error: ${error.message}`);
    testResults.consoleErrors.push({
      message: `Test execution error: ${error.message}`,
      timestamp: new Date().toISOString()
    });
  } finally {
    await browser.close();
  }

  // Generate Recommendations
  console.log('\n📊 GENERATING RECOMMENDATIONS...');
  console.log('=====================================');

  if (!testResults.loginPageLoad) {
    testResults.recommendations.push('❗ Login page failed to load properly - check routing and component structure');
  }

  if (!testResults.formValidation) {
    testResults.recommendations.push('❗ Form validation not working - implement client-side validation');
  }

  if (!testResults.googleButtonPresent) {
    testResults.recommendations.push('❗ Google sign-in button missing - verify Firebase setup and button implementation');
  }

  if (!testResults.protectedRouteRedirect) {
    testResults.recommendations.push('❗ Protected routes not working - implement middleware or route protection');
  }

  if (!testResults.authContextWorking) {
    testResults.recommendations.push('❗ Auth context may not be working - verify AuthProvider wrapping and context usage');
  }

  if (testResults.consoleErrors.length > 0) {
    testResults.recommendations.push(`❗ ${testResults.consoleErrors.length} console errors detected - review browser console`);
  }

  return testResults;
}

// Analysis function
function generateTestReport(results) {
  console.log('\n🎯 COMPREHENSIVE TEST REPORT');
  console.log('=============================');
  
  const testSummary = {
    totalTests: 7,
    passedTests: 0,
    failedTests: 0,
    overallHealth: 'Unknown'
  };

  // Count passed tests
  if (results.loginPageLoad) testSummary.passedTests++;
  if (results.formValidation) testSummary.passedTests++;
  if (results.googleButtonPresent) testSummary.passedTests++;
  if (results.protectedRouteRedirect) testSummary.passedTests++;
  if (results.authContextWorking) testSummary.passedTests++;
  if (results.consoleErrors.length === 0) testSummary.passedTests++;
  
  testSummary.failedTests = testSummary.totalTests - testSummary.passedTests;
  
  // Determine overall health
  const passRate = (testSummary.passedTests / testSummary.totalTests) * 100;
  if (passRate >= 85) testSummary.overallHealth = '🟢 Excellent';
  else if (passRate >= 70) testSummary.overallHealth = '🟡 Good';
  else if (passRate >= 50) testSummary.overallHealth = '🟠 Fair';
  else testSummary.overallHealth = '🔴 Critical';

  console.log(`\n📈 TEST SUMMARY`);
  console.log(`   Total Tests: ${testSummary.totalTests}`);
  console.log(`   Passed: ${testSummary.passedTests}`);
  console.log(`   Failed: ${testSummary.failedTests}`);
  console.log(`   Pass Rate: ${passRate.toFixed(1)}%`);
  console.log(`   Overall Health: ${testSummary.overallHealth}`);

  console.log(`\n🔍 DETAILED RESULTS`);
  console.log(`   Login Page Load: ${results.loginPageLoad ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Form Validation: ${results.formValidation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Google Button: ${results.googleButtonPresent ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Protected Routes: ${results.protectedRouteRedirect ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Auth Context: ${results.authContextWorking ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Console Clean: ${results.consoleErrors.length === 0 ? '✅ PASS' : '❌ FAIL'}`);

  if (results.consoleErrors.length > 0) {
    console.log(`\n🚨 CONSOLE ERRORS (${results.consoleErrors.length})`);
    results.consoleErrors.slice(0, 5).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.message}`);
    });
    if (results.consoleErrors.length > 5) {
      console.log(`   ... and ${results.consoleErrors.length - 5} more errors`);
    }
  }

  console.log(`\n💡 RECOMMENDATIONS`);
  if (results.recommendations.length === 0) {
    console.log(`   🎉 No critical issues found! Authentication system appears to be working well.`);
  } else {
    results.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
  }

  return testSummary;
}

// Run the tests
runAuthenticationTests()
  .then(results => {
    const summary = generateTestReport(results);
    
    console.log('\n🏁 TESTING COMPLETE');
    console.log('===================');
    console.log(`Overall Status: ${summary.overallHealth}`);
    console.log(`Pass Rate: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%`);
    
    process.exit(summary.passedTests === summary.totalTests ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });
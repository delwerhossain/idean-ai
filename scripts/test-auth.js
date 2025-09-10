#!/usr/bin/env node

/**
 * Authentication Flow Test Script
 * Tests the complete authentication flow from frontend to backend integration
 */

const { chromium } = require('playwright');

const TEST_URL = 'http://localhost:3005';
const TEST_USERS = [
  { email: 'john@entrepreneur.com', password: 'password123', name: 'John Doe' },
  { email: 'sarah@marketer.com', password: 'password123', name: 'Sarah Wilson' },
  { email: 'admin@idean.ai', password: 'admin123', name: 'Admin User' }
];

async function testAuthenticationFlow() {
  console.log('🚀 Starting Authentication Flow Test...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await chromium.launch({ 
      headless: false, // Show browser for visual verification
      slowMo: 1000 // Slow down actions for better visibility
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Test each user
    for (const user of TEST_USERS) {
      console.log(`\n📝 Testing authentication for: ${user.email}`);
      
      await testUserAuthentication(page, user);
      
      // Clear session between tests
      await context.clearCookies();
      await page.reload();
    }
    
    console.log('\n✅ All authentication tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function testUserAuthentication(page, user) {
  try {
    // 1. Navigate to login page
    console.log('  🌐 Navigating to login page...');
    await page.goto(`${TEST_URL}/login`);
    await page.waitForLoadState('networkidle');
    
    // 2. Verify login form is present
    console.log('  🔍 Checking login form...');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]');
    await page.waitForSelector('button[type="submit"]');
    
    // 3. Fill in credentials
    console.log('  ✏️ Filling credentials...');
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    
    // 4. Submit login form
    console.log('  📤 Submitting login...');
    
    // Listen for network requests to track authentication
    const authRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/auth/') || request.url().includes('auth')) {
        authRequests.push({
          url: request.url(),
          method: request.method()
        });
      }
    });
    
    await page.click('button[type="submit"]');
    
    // Wait for redirect or authentication to complete
    await page.waitForTimeout(3000);
    
    // 5. Check if redirected successfully
    const currentUrl = page.url();
    console.log(`  📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard') || currentUrl.includes('/onboarding')) {
      console.log('  ✅ Login successful - redirected to dashboard/onboarding');
      
      // 6. Check session data using JavaScript
      console.log('  🔍 Checking session data...');
      const sessionData = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Check if NextAuth session exists
          fetch('/api/auth/session')
            .then(response => response.json())
            .then(data => resolve(data))
            .catch(error => resolve({ error: error.message }));
        });
      });
      
      console.log('  📊 Session data:', JSON.stringify(sessionData, null, 2));
      
      // 7. Verify backend token exists
      if (sessionData.backendToken) {
        console.log('  ✅ Backend token found in session');
      } else {
        console.log('  ⚠️ Backend token missing from session');
      }
      
      // 8. Check for backend warning on onboarding page
      if (currentUrl.includes('/onboarding')) {
        console.log('  🔍 Checking for backend warnings...');
        const warningExists = await page.$('.bg-yellow-50');
        if (warningExists) {
          const warningText = await warningExists.textContent();
          if (warningText.includes('Backend not connected')) {
            console.log('  ❌ Backend warning still present:', warningText);
          } else {
            console.log('  ✅ No backend connection warning found');
          }
        } else {
          console.log('  ✅ No backend connection warning found');
        }
      }
      
      // 9. Check localStorage for test user data
      const localStorageData = await page.evaluate(() => {
        return {
          hasCompletedOnboarding: localStorage.getItem('hasCompletedOnboarding'),
          userName: localStorage.getItem('userName'),
          businessName: localStorage.getItem('businessName'),
          testUsers: localStorage.getItem('test_users'),
          currentUser: localStorage.getItem('current_user')
        };
      });
      
      console.log('  💾 LocalStorage data:', JSON.stringify(localStorageData, null, 2));
      
    } else {
      console.log('  ❌ Login failed - still on login page');
      
      // Check for error messages
      const errorMessage = await page.$('.text-red-600, .text-red-800');
      if (errorMessage) {
        const errorText = await errorMessage.textContent();
        console.log('  ❌ Error message:', errorText);
      }
    }
    
    console.log(`  📋 Authentication requests made: ${authRequests.length}`);
    authRequests.forEach((req, i) => {
      console.log(`    ${i + 1}. ${req.method} ${req.url}`);
    });
    
  } catch (error) {
    console.error(`  ❌ Test failed for ${user.email}:`, error.message);
  }
}

// Add a simple test to verify test users are properly configured
async function verifyTestUserConfiguration() {
  console.log('🔧 Verifying test user configuration...\n');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Navigate to the site
    await page.goto(TEST_URL);
    
    // Execute JavaScript to check test user initialization
    const testUserCheck = await page.evaluate(() => {
      // Import test user functions
      return new Promise((resolve) => {
        // Check if we can access test user functions
        try {
          // This would normally be available through the module
          const testUsersExist = localStorage.getItem('test_users');
          resolve({
            testUsersInStorage: testUsersExist ? JSON.parse(testUsersExist) : null,
            storageKeys: Object.keys(localStorage),
            success: true
          });
        } catch (error) {
          resolve({
            error: error.message,
            success: false
          });
        }
      });
    });
    
    console.log('Test user configuration check:', JSON.stringify(testUserCheck, null, 2));
    
  } catch (error) {
    console.error('Configuration check failed:', error);
  } finally {
    await browser.close();
  }
}

// Run the tests
async function runAllTests() {
  console.log('🧪 Starting Comprehensive Authentication Test Suite\n');
  console.log('=' * 60);
  
  await verifyTestUserConfiguration();
  await testAuthenticationFlow();
  
  console.log('\n' + '=' * 60);
  console.log('🎯 Test Suite Complete');
}

// Check if Playwright is installed
try {
  require('playwright');
} catch (error) {
  console.log('❌ Playwright not found. Installing...');
  console.log('Please run: npm install playwright');
  console.log('Then run: npx playwright install chromium');
  process.exit(1);
}

// Run tests
runAllTests().catch(console.error);
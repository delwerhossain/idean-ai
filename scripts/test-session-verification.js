#!/usr/bin/env node

/**
 * Session Verification Test
 * Verifies that logged-in users have backend tokens and don't see warnings
 */

const { chromium } = require('playwright');

async function testSessionData() {
  console.log('🔍 Testing Session Data and Backend Token...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Step 1: Navigate to login
    console.log('1. 🌐 Navigating to login page...');
    await page.goto('http://localhost:3005/login');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Login
    console.log('2. 🔑 Logging in with john@entrepreneur.com...');
    await page.fill('input[type="email"]', 'john@entrepreneur.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Listen for session updates
    page.on('response', response => {
      if (response.url().includes('/api/auth/session')) {
        console.log(`   📡 Session API call: ${response.status()}`);
      }
    });
    
    await page.click('button[type="submit"]');
    
    // Wait for authentication to complete
    await page.waitForTimeout(2000);
    
    // Step 3: Check current location
    const currentUrl = page.url();
    console.log(`3. 📍 Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('   ✅ Successfully redirected to dashboard');
      
      // Step 4: Get session data
      console.log('4. 📊 Retrieving session data...');
      const sessionResponse = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/auth/session');
          return await response.json();
        } catch (error) {
          return { error: error.message };
        }
      });
      
      console.log('   Session data:');
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   📧 Email: ${sessionResponse.user?.email || 'N/A'}`);
      console.log(`   👤 Name: ${sessionResponse.user?.name || 'N/A'}`);
      console.log(`   🏢 Role: ${sessionResponse.user?.role || 'N/A'}`);
      console.log(`   🏪 Business ID: ${sessionResponse.user?.businessId || 'N/A'}`);
      console.log(`   🔑 Backend Token: ${sessionResponse.backendToken ? '✅ Present' : '❌ Missing'}`);
      console.log(`   ⏰ Token Expiry: ${sessionResponse.tokenExpiry ? new Date(sessionResponse.tokenExpiry).toLocaleString() : 'N/A'}`);
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Step 5: Check for backend warning
      console.log('5. 🚨 Checking for backend connection warnings...');
      
      // If we're on dashboard, go to onboarding to check for warning
      if (!currentUrl.includes('/onboarding')) {
        await page.goto('http://localhost:3005/dashboard/onboarding');
        await page.waitForLoadState('networkidle');
      }
      
      // Look for the warning message
      const warningElement = await page.$('.bg-yellow-50');
      if (warningElement) {
        const warningText = await warningElement.textContent();
        if (warningText.includes('Backend not connected')) {
          console.log('   ❌ Backend connection warning found:');
          console.log(`   "${warningText.trim()}"`);
        } else {
          console.log('   ✅ No backend connection warning (different yellow banner)');
        }
      } else {
        console.log('   ✅ No backend connection warning found');
      }
      
      // Step 6: Test key authentication features
      console.log('6. 🧪 Testing authentication features...');
      
      const features = {
        sessionExists: !!sessionResponse.user,
        hasBackendToken: !!sessionResponse.backendToken,
        hasUserRole: !!sessionResponse.user?.role,
        hasBusinessId: !!sessionResponse.user?.businessId,
        noBackendWarning: !warningElement || !(await warningElement.textContent()).includes('Backend not connected')
      };
      
      console.log('   Feature checklist:');
      console.log(`   ${features.sessionExists ? '✅' : '❌'} User session exists`);
      console.log(`   ${features.hasBackendToken ? '✅' : '❌'} Backend token present`);
      console.log(`   ${features.hasUserRole ? '✅' : '❌'} User role assigned`);
      console.log(`   ${features.hasBusinessId ? '✅' : '❌'} Business ID present`);
      console.log(`   ${features.noBackendWarning ? '✅' : '❌'} No backend warning`);
      
      const allPassed = Object.values(features).every(f => f);
      console.log(`\n   Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME ISSUES FOUND'}`);
      
      if (allPassed) {
        console.log('\n🎉 Authentication integration is working perfectly!');
        console.log('   - Test users login successfully');
        console.log('   - Backend tokens are provided');
        console.log('   - No connection warnings appear');
        console.log('   - Session data is complete');
      }
      
    } else {
      console.log('   ❌ Login failed - not redirected to dashboard');
      
      // Check for error messages
      const errorElement = await page.$('.text-red-600, .text-red-800, .text-red-500');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log(`   Error: ${errorText}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Keep browser open for manual inspection
    console.log('\n⏸️ Browser left open for manual verification. Close when done.');
    // await browser.close();
  }
}

testSessionData().catch(console.error);
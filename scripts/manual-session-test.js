#!/usr/bin/env node

/**
 * Manual Session Test
 * Tests session data after successful login
 */

const { chromium } = require('playwright');

async function manualSessionTest() {
  console.log('🔍 Manual Session Test\n');
  
  console.log('This test requires manual interaction:');
  console.log('1. A browser will open to the login page');
  console.log('2. Please login with: john@entrepreneur.com / password123');
  console.log('3. The script will then check the session data');
  console.log('\nPress Enter to continue...');
  
  // Wait for user input
  process.stdin.setRawMode(true);
  return new Promise((resolve) => {
    process.stdin.once('data', async () => {
      process.stdin.setRawMode(false);
      
      const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
      });
      
      const context = await browser.newContext();
      const page = await context.newPage();
      
      try {
        // Navigate to login
        console.log('\n🌐 Opening login page...');
        await page.goto('http://localhost:3005/login');
        
        console.log('Please login manually with john@entrepreneur.com / password123');
        console.log('When you see the dashboard, press Enter to check session...');
        
        // Wait for user to login manually
        process.stdin.setRawMode(true);
        process.stdin.once('data', async () => {
          process.stdin.setRawMode(false);
          
          // Check session
          console.log('\n📊 Checking session data...');
          const sessionData = await page.evaluate(async () => {
            try {
              const response = await fetch('/api/auth/session');
              const data = await response.json();
              return {
                success: true,
                data: data
              };
            } catch (error) {
              return {
                success: false,
                error: error.message
              };
            }
          });
          
          if (sessionData.success) {
            console.log('\n✅ Session data retrieved successfully:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('User Info:');
            console.log(`  📧 Email: ${sessionData.data.user?.email || 'N/A'}`);
            console.log(`  👤 Name: ${sessionData.data.user?.name || 'N/A'}`);
            console.log(`  🏢 Role: ${sessionData.data.user?.role || 'N/A'}`);
            console.log(`  🏪 Business ID: ${sessionData.data.user?.businessId || 'N/A'}`);
            console.log(`  🔗 Provider: ${sessionData.data.user?.provider || 'N/A'}`);
            console.log(`  ✅ Email Verified: ${sessionData.data.user?.emailVerified || false}`);
            
            console.log('\nBackend Integration:');
            console.log(`  🔑 Backend Token: ${sessionData.data.backendToken ? '✅ Present' : '❌ Missing'}`);
            console.log(`  🔄 Access Token: ${sessionData.data.accessToken ? '✅ Present' : '❌ Missing'}`);
            console.log(`  ⏰ Token Expiry: ${sessionData.data.tokenExpiry ? new Date(sessionData.data.tokenExpiry).toLocaleString() : 'N/A'}`);
            
            if (sessionData.data.backendToken) {
              console.log(`  📝 Token Preview: ${sessionData.data.backendToken.substring(0, 20)}...`);
            }
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            
            // Navigate to onboarding to check for warnings
            console.log('\n🚨 Checking for backend warnings...');
            await page.goto('http://localhost:3005/dashboard/onboarding');
            await page.waitForLoadState('networkidle');
            
            const warningSelector = '.bg-yellow-50';
            const warningExists = await page.$(warningSelector);
            
            if (warningExists) {
              const warningText = await warningExists.textContent();
              if (warningText.includes('Backend not connected')) {
                console.log('❌ Backend connection warning found:');
                console.log(`   "${warningText.trim()}"`);
              } else {
                console.log('✅ No backend connection warning (different yellow banner)');
              }
            } else {
              console.log('✅ No backend connection warning found');
            }
            
            // Final assessment
            const hasBackendToken = !!sessionData.data.backendToken;
            const noBackendWarning = !warningExists || !(await warningExists.textContent()).includes('Backend not connected');
            
            console.log('\n🎯 Final Assessment:');
            if (hasBackendToken && noBackendWarning) {
              console.log('✅ AUTHENTICATION INTEGRATION SUCCESSFUL!');
              console.log('   - Test user login works');
              console.log('   - Backend token is provided');
              console.log('   - No connection warnings shown');
              console.log('   - User data is complete');
            } else {
              console.log('⚠️ PARTIAL SUCCESS:');
              console.log(`   - Backend token: ${hasBackendToken ? '✅' : '❌'}`);
              console.log(`   - No warnings: ${noBackendWarning ? '✅' : '❌'}`);
            }
          } else {
            console.log('❌ Failed to retrieve session data:', sessionData.error);
          }
          
          console.log('\nPress Enter to close browser...');
          process.stdin.setRawMode(true);
          process.stdin.once('data', async () => {
            process.stdin.setRawMode(false);
            await browser.close();
            resolve();
          });
        });
      } catch (error) {
        console.error('❌ Test error:', error.message);
        await browser.close();
        resolve();
      }
    });
  });
}

manualSessionTest().catch(console.error);
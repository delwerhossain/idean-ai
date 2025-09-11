#!/usr/bin/env node

/**
 * Backend Database Seeding Script
 * Seeds test users and business data using the backend API
 */

const { default: fetch } = require('node-fetch');

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8001';
const API_BASE = `${BACKEND_URL}/api/v1`;

// Test users data matching frontend test-users.ts
const TEST_USERS = [
  {
    email: 'john@entrepreneur.com',
    name: 'John Doe',
    provider: 'email',
    business: {
      business_name: 'Tech Startup Solutions',
      website_url: 'https://techstartup.example.com',
      industry_tag: 'Technology',
      business_documents: ['tech-business-plan.pdf', 'startup-pitch-deck.pdf'],
      business_context: 'AI-powered startup solutions for small businesses',
      language: 'English',
      mentor_approval: 'approved',
      adds_history: ['google-ads-history.json', 'facebook-ads-history.json'],
      module_select: 'pro',
      readiness_checklist: 'completed'
    }
  },
  {
    email: 'sarah@marketer.com',
    name: 'Sarah Johnson',
    provider: 'email',
    business: {
      business_name: 'Digital Marketing Pro',
      website_url: 'https://digitalmarketing.example.com',
      industry_tag: 'Marketing',
      business_documents: ['marketing-strategy.pdf'],
      business_context: 'Full-service digital marketing agency',
      language: 'English',
      mentor_approval: 'approved',
      adds_history: ['facebook-campaigns.json'],
      module_select: 'standard',
      readiness_checklist: 'completed'
    }
  },
  {
    email: 'admin@ideanai.com',
    name: 'Admin User',
    provider: 'email',
    business: {
      business_name: 'iDEAN AI Platform',
      website_url: 'https://ideanai.example.com',
      industry_tag: 'SaaS',
      business_documents: ['saas-business-model.pdf', 'ai-platform-docs.pdf'],
      business_context: 'AI-powered business strategy platform',
      language: 'English',
      mentor_approval: 'approved',
      adds_history: ['google-ads.json', 'linkedin-ads.json'],
      module_select: 'pro',
      readiness_checklist: 'completed'
    }
  },
  {
    email: 'demo@ideanai.com',
    name: 'Demo User',
    provider: 'email',
    business: {
      business_name: 'Demo Business',
      website_url: 'https://demo.example.com',
      industry_tag: 'Consulting',
      business_documents: [],
      business_context: 'Demo business for testing purposes',
      language: 'English',
      mentor_approval: 'pending',
      adds_history: [],
      module_select: 'standard',
      readiness_checklist: 'in_progress'
    }
  }
];

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return await response.json();
}

async function registerUser(userData) {
  console.log(`Registering user: ${userData.email}`);
  
  try {
    const registerData = {
      email: userData.email,
      name: userData.name,
      provider: userData.provider,
      firebaseToken: `mock_firebase_token_${Date.now()}`
    };

    const result = await makeRequest(`${API_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(registerData)
    });

    console.log(`✅ User registered: ${userData.email}`);
    return result;
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log(`⚠️  User already exists: ${userData.email}`);
      
      // Try to login to get the token
      try {
        const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            email: userData.email,
            firebaseToken: `mock_firebase_token_${Date.now()}`
          })
        });
        return loginResult;
      } catch (loginError) {
        console.log(`❌ Login failed for existing user: ${userData.email}:`, loginError.message);
        return null;
      }
    } else {
      console.log(`❌ Registration failed: ${userData.email}:`, error.message);
      return null;
    }
  }
}

async function createBusiness(businessData, authToken) {
  console.log(`Creating business: ${businessData.business_name}`);
  
  try {
    const result = await makeRequest(`${API_BASE}/businesses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(businessData)
    });

    console.log(`✅ Business created: ${businessData.business_name}`);
    return result;
  } catch (error) {
    console.log(`❌ Business creation failed: ${businessData.business_name}:`, error.message);
    return null;
  }
}

async function checkBackendHealth() {
  try {
    const health = await makeRequest(`${BACKEND_URL}/health`);
    console.log('✅ Backend is healthy:', health);
    return true;
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  console.log(`Backend URL: ${BACKEND_URL}`);
  
  // Check backend health
  const isHealthy = await checkBackendHealth();
  if (!isHealthy) {
    console.log('❌ Backend is not responding. Make sure the backend server is running on port 8001.');
    process.exit(1);
  }

  let successCount = 0;
  let businessCount = 0;

  // Register users and create businesses
  for (const userData of TEST_USERS) {
    console.log(`\\n--- Processing ${userData.email} ---`);
    
    // Register user
    const registrationResult = await registerUser(userData);
    
    if (registrationResult && registrationResult.token) {
      successCount++;
      
      // Create business for this user
      const businessResult = await createBusiness(userData.business, registrationResult.token);
      
      if (businessResult) {
        businessCount++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log('\\n🎉 Seeding completed!');
  console.log(`✅ Users processed: ${successCount}/${TEST_USERS.length}`);
  console.log(`✅ Businesses created: ${businessCount}/${TEST_USERS.length}`);
  
  if (successCount === TEST_USERS.length) {
    console.log('\\n🚀 All test users and businesses have been seeded successfully!');
    console.log('\\nYou can now login with:');
    TEST_USERS.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });
  } else {
    console.log('\\n⚠️  Some users failed to seed. Check the errors above.');
  }
}

// Handle fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = fetch;
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\\n✅ Seeding script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\\n❌ Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
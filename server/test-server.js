// Simple script to test the Claude API server
import fetch from 'node-fetch';

const SERVER_URL = 'http://localhost:3000';

async function testServer() {
  console.log('Testing Claude API server...');
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${SERVER_URL}/api/health`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check successful:', healthData);
    } else {
      console.error('❌ Health check failed:', healthResponse.status, healthResponse.statusText);
    }
    
    // Test chat endpoint
    console.log('\nTesting chat endpoint...');
    const chatResponse = await fetch(`${SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello, this is a test message',
        conversationId: null,
        sessionHistory: []
      })
    });
    
    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      console.log('✅ Chat endpoint successful');
      console.log('Response:', chatData);
    } else {
      const errorText = await chatResponse.text();
      console.error('❌ Chat endpoint failed:', chatResponse.status, chatResponse.statusText);
      console.error('Error details:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
  }
}

testServer();

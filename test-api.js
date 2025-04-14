// Simple HTTP request to test the backend API
const http = require('http');

// Function to make a GET request
function httpGet(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      // Handle response data
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      // Handle end of response
      res.on('end', () => {
        console.log(`Status code: ${res.statusCode}`);
        console.log(`Headers: ${JSON.stringify(res.headers)}`);
        
        try {
          const parsedData = JSON.parse(data);
          console.log('Response data:', parsedData);
          resolve(parsedData);
        } catch (e) {
          console.log('Raw response data:', data);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error('Request error:', err.message);
      reject(err);
    });
  });
}

// Test endpoints
async function testEndpoints() {
  try {
    console.log('Testing health endpoint...');
    await httpGet('http://localhost:4000/health');
    
    console.log('\nTesting active hackathon endpoint...');
    await httpGet('http://localhost:4000/api/hackathons/active');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testEndpoints();
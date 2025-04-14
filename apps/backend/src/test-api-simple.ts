import http from 'http';

function makeRequest(path: string) {
  const options = {
    hostname: 'localhost',
    port: 4000, // Updated to 4000
    path: path,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          console.log(`Response status: ${res.statusCode}`);
          
          if (res.statusCode === 200) {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } else {
            console.log(`Response body: ${data}`);
            resolve(null);
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
          console.log('Raw response:', data);
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.error(`Request error: ${e.message}`);
      reject(e);
    });
    
    req.end();
  });
}

async function testApi() {
  try {
    console.log('Testing health check endpoint...');
    const healthCheck = await makeRequest('/health');
    console.log('Health check response:', healthCheck);
    
    console.log('\nTesting active hackathon endpoint...');
    const activeHackathon = await makeRequest('/api/hackathons/active');
    console.log('Active hackathon response:', activeHackathon);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testApi();
import http from 'http';

// Helper function to make HTTP GET requests
function httpGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(data);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testApi() {
  try {
    console.log('Testing API endpoints...');
    
    // Get active hackathon
    console.log('\n1. Testing /api/hackathons/active');
    const hackathon = await httpGet('http://localhost:3000/api/hackathons/active');
    console.log(JSON.stringify(hackathon, null, 2));
    
    // Get tracks for active hackathon
    console.log('\n2. Testing /api/hackathons/tracks');
    const tracks = await httpGet('http://localhost:3000/api/hackathons/tracks');
    console.log(JSON.stringify(tracks, null, 2));
    
    // Get submissions for active hackathon
    console.log('\n3. Testing /api/hackathons/submissions');
    const submissions = await httpGet('http://localhost:3000/api/hackathons/submissions');
    console.log(JSON.stringify(submissions, null, 2));
    
    // Get sponsors for active hackathon
    console.log('\n4. Testing /api/hackathons/sponsors');
    const sponsors = await httpGet('http://localhost:3000/api/hackathons/sponsors');
    console.log(JSON.stringify(sponsors, null, 2));
    
    console.log('\nAPI tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error testing API:', error);
    process.exit(1);
  }
}

testApi();
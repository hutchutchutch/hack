import React, { useEffect, useState } from 'react';

interface Hackathon {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  submissionCount?: number;
  hackerCount?: number;
  tracks?: any[];
}

function App() {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveHackathon = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/hackathons/active');
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        setHackathon(data);
      } catch (err) {
        setError(`Failed to fetch hackathon: ${err instanceof Error ? err.message : String(err)}`);
        console.error('Error fetching hackathon:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveHackathon();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Hackistan</h1>
        <p className="text-gray-600">Your Hackathon Platform</p>
      </header>

      <main>
        {loading ? (
          <p className="text-gray-600">Loading hackathon data...</p>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <p className="mt-2">Make sure the backend server is running at http://localhost:4000</p>
          </div>
        ) : hackathon ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{hackathon.title}</h2>
            <p className="text-gray-700 mb-4">{hackathon.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700">Start Date</h3>
                <p>{new Date(hackathon.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">End Date</h3>
                <p>{new Date(hackathon.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Status</h3>
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {hackathon.status}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Submissions</h3>
                <p>{hackathon.submissionCount || 0}</p>
              </div>
            </div>

            {hackathon.tracks && hackathon.tracks.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold mb-3">Tracks</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hackathon.tracks.map(track => (
                    <div key={track.id} className="border rounded-md p-4 bg-gray-50">
                      <h4 className="font-bold">{track.trackName}</h4>
                      {track.description && <p className="text-sm text-gray-600 mt-1">{track.description}</p>}
                      <p className="text-sm mt-2">
                        <span className="font-medium">Submissions:</span> {track.submissionCount || 0}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-600">No active hackathon found.</p>
        )}
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>Hackistan Platform &copy; {new Date().getFullYear()}</p>
        <p className="mt-1">
          <a 
            href="http://localhost:8080" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Access PgAdmin
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
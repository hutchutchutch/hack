import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { hackathonApi } from '../../../services/api';
import { Track } from '../../../types/hackathon';

const TracksPage: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const data = await hackathonApi.getTracks();
        setTracks(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching tracks:', err);
        setError('Failed to load track data');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading tracks...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="tracks-container">
      <header className="tracks-header">
        <h1>Hackathon Tracks</h1>
        <p>Choose from one of our {tracks.length} exciting tracks for your project submission.</p>
      </header>

      <div className="tracks-grid">
        {tracks.map(track => (
          <div key={track.id} className="track-card">
            <h2>{track.title}</h2>
            <div className="track-stats">
              <span>{track.submissionCount} Submissions</span>
            </div>
            <p className="track-description">{track.description}</p>
            
            <div className="track-prizes">
              <h3>Prizes</h3>
              <ul>
                {track.prizes.map((prize, index) => (
                  <li key={index}>{prize}</li>
                ))}
              </ul>
            </div>
            
            <div className="track-requirements">
              <h3>Requirements</h3>
              <ul>
                {track.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
            
            <div className="track-actions">
              <button className="primary-button">Submit to this Track</button>
              <Link to={`/active-hackathon/submissions?track=${track.id}`} className="secondary-button">
                View Submissions
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TracksPage;

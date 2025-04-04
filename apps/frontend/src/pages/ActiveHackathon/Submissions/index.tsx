import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { hackathonApi } from '../../../services/api';
import { Submission } from '../../../types/hackathon';

const SubmissionsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const trackFilter = searchParams.get('track');
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent');
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [trackName, setTrackName] = useState<string>('');

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const trackId = trackFilter ? parseInt(trackFilter) : undefined;
        const data = await hackathonApi.getSubmissions(trackId);
        setSubmissions(data);
        
        // Set track name if filtering by track
        if (data.length > 0 && trackId) {
          setTrackName(data[0].trackName);
        } else {
          setTrackName('');
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load submissions');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [trackFilter]);

  // Sort submissions based on user selection
  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime();
    } else {
      // Default to overall rating, or 0 if not available
      const ratingA = a.avgRating?.overall || 0;
      const ratingB = b.avgRating?.overall || 0;
      return ratingB - ratingA;
    }
  });

  if (loading) {
    return <div className="loading-container">Loading submissions...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="submissions-container">
      <header className="submissions-header">
        <h1>
          {trackFilter 
            ? `${trackName || 'Track'} Submissions` 
            : 'All Hackathon Submissions'}
        </h1>
        <p>{sortedSubmissions.length} projects submitted so far</p>
      </header>

      <div className="submissions-controls">
        <div className="filters">
          <Link to="/active-hackathon/submissions" className={!trackFilter ? 'active' : ''}>
            All Tracks
          </Link>
          <Link to="/active-hackathon/submissions?track=1" className={trackFilter === '1' ? 'active' : ''}>
            Business
          </Link>
          <Link to="/active-hackathon/submissions?track=2" className={trackFilter === '2' ? 'active' : ''}>
            Creative
          </Link>
          <Link to="/active-hackathon/submissions?track=3" className={trackFilter === '3' ? 'active' : ''}>
            Personal
          </Link>
          <Link to="/active-hackathon/submissions?track=4" className={trackFilter === '4' ? 'active' : ''}>
            Open
          </Link>
        </div>
        <div className="sort-options">
          <span>Sort by:</span>
          <button 
            className={sortBy === 'recent' ? 'active' : ''}
            onClick={() => setSortBy('recent')}
          >
            Most Recent
          </button>
          <button 
            className={sortBy === 'rating' ? 'active' : ''}
            onClick={() => setSortBy('rating')}
          >
            Highest Rated
          </button>
        </div>
      </div>

      {sortedSubmissions.length === 0 ? (
        <div className="no-submissions">
          <p>No submissions found for this track yet. Be the first to submit!</p>
        </div>
      ) : (
        <div className="submissions-grid">
          {sortedSubmissions.map(submission => (
            <div key={submission.id} className="submission-card">
              <div className="submission-thumbnail">
                {submission.thumbnailUrl ? (
                  <img src={submission.thumbnailUrl} alt={submission.title} />
                ) : (
                  <div className="placeholder-image">{/* Placeholder for thumbnail */}</div>
                )}
              </div>
              <div className="submission-content">
                <h2>{submission.title}</h2>
                <p className="team-name">by {submission.teamName}</p>
                <p className="track-name">{submission.trackName}</p>
                <p className="submission-description">{submission.description}</p>
                <div className="submission-meta">
                  <div className="submission-rating">
                    <span className="rating-value">
                      {submission.avgRating ? submission.avgRating.overall.toFixed(1) : 'Not rated'}
                    </span>
                    {submission.reviewCount !== undefined && submission.reviewCount > 0 && (
                      <span className="rating-count">({submission.reviewCount} reviews)</span>
                    )}
                  </div>
                  <span className="submission-date">
                    Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="submission-actions">
                  <Link to={`/active-hackathon/review/${submission.id}`} className="primary-button">
                    Review Project
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;

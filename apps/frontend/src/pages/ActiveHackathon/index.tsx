import React, { useEffect, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Tracks from './Tracks';
import Submissions from './Submissions';
import Sponsors from './Sponsors';
import Review from './Review';
import { hackathonApi } from '../../services/api';
import { Hackathon } from '../../types/hackathon';

const ActiveHackathonPage: React.FC = () => {
  const [hackathon, setHackathon] = useState<Hackathon | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHackathon = async () => {
      try {
        setLoading(true);
        const data = await hackathonApi.getActiveHackathon();
        setHackathon(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching hackathon:', err);
        setError('Failed to load hackathon data');
      } finally {
        setLoading(false);
      }
    };

    fetchHackathon();
  }, []);

  if (loading) {
    return <div className="loading-container">Loading hackathon data...</div>;
  }

  if (error || !hackathon) {
    return <div className="error-container">{error || 'No active hackathon found'}</div>;
  }

  // Calculate days remaining
  const endDate = new Date(hackathon.endDate);
  const currentDate = new Date();
  const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="active-hackathon-container">
      <header className="hackathon-header">
        <h1>{hackathon.title}</h1>
        <p className="hackathon-dates">
          {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
        </p>
        <div className="hackathon-stats">
          <span>{hackathon.submissionCount} Submissions</span>
          <span>{hackathon.participantCount} Participants</span>
          <span>{daysRemaining} Days Remaining</span>
        </div>
      </header>

      <nav className="hackathon-nav">
        <Link to="/active-hackathon">Overview</Link>
        <Link to="/active-hackathon/tracks">Tracks</Link>
        <Link to="/active-hackathon/submissions">Submissions</Link>
        <Link to="/active-hackathon/sponsors">Sponsors</Link>
      </nav>

      <section className="hackathon-content">
        <Routes>
          <Route path="/" element={<HackathonOverview hackathon={hackathon} />} />
          <Route path="/tracks" element={<Tracks />} />
          <Route path="/submissions" element={<Submissions />} />
          <Route path="/sponsors" element={<Sponsors />} />
          <Route path="/review/:submissionId" element={<Review />} />
        </Routes>
      </section>
    </div>
  );
};

interface HackathonOverviewProps {
  hackathon: Hackathon;
}

const HackathonOverview: React.FC<HackathonOverviewProps> = ({ hackathon }) => {
  const [featuredTracks, setFeaturedTracks] = useState<any[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Get the first 3 tracks to feature
    setFeaturedTracks(hackathon.tracks.slice(0, 3));

    // Fetch recent submissions
    const fetchRecentSubmissions = async () => {
      try {
        const submissions = await hackathonApi.getSubmissions();
        // Get the 2 most recent submissions
        setRecentSubmissions(submissions.slice(0, 2));
      } catch (err) {
        console.error('Error fetching recent submissions:', err);
      }
    };

    fetchRecentSubmissions();
  }, [hackathon]);

  return (
    <div className="overview-container">
      <section className="hackathon-description">
        <h2>Welcome to {hackathon.title}!</h2>
        <p>{hackathon.description}</p>
      </section>

      <section className="featured-tracks">
        <h2>Featured Tracks</h2>
        <div className="track-cards">
          {featuredTracks.map(track => (
            <div key={track.id} className="track-card">
              <h3>{track.title}</h3>
              <p>{track.description}</p>
              <Link to="/active-hackathon/tracks">Learn More →</Link>
            </div>
          ))}
        </div>
      </section>

      <section className="submission-cta">
        <h2>Ready to Submit Your Project?</h2>
        <p>Projects must be submitted before {new Date(hackathon.endDate).toLocaleDateString()} at 11:59 PM UTC.</p>
        <button className="primary-button">Submit Your Project</button>
      </section>

      {recentSubmissions.length > 0 && (
        <section className="recent-submissions">
          <h2>Recent Submissions</h2>
          <div className="submission-cards">
            {recentSubmissions.map(submission => (
              <div key={submission.id} className="submission-card">
                <h3>{submission.title}</h3>
                <p>{submission.description}</p>
                <div className="submission-meta">
                  <span>{submission.trackName}</span>
                  <span>Submitted {new Date(submission.submissionDate).toLocaleDateString()}</span>
                </div>
                <Link to={`/active-hackathon/review/${submission.id}`}>Review Project →</Link>
              </div>
            ))}
          </div>
          <Link to="/active-hackathon/submissions" className="see-all-link">See All Submissions →</Link>
        </section>
      )}
    </div>
  );
};

export default ActiveHackathonPage;

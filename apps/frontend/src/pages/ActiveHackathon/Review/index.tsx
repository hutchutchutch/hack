import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hackathonApi } from '../../../services/api';
import { Submission, Review as ReviewType } from '../../../types/hackathon';

const ReviewPage: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for submitting a review
  const [userRatings, setUserRatings] = useState({
    innovation: 0,
    implementation: 0,
    impact: 0,
    presentation: 0
  });
  const [userComment, setUserComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!submissionId) return;
      
      try {
        setLoading(true);
        const id = parseInt(submissionId);
        
        // Fetch both submission details and reviews in parallel
        const [submissionData, reviewsData] = await Promise.all([
          hackathonApi.getSubmission(id),
          hackathonApi.getReviews(id)
        ]);
        
        setSubmission(submissionData);
        setReviews(reviewsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching submission data:', err);
        setError('Failed to load submission data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [submissionId]);

  const handleRatingChange = (category: keyof typeof userRatings, value: number) => {
    setUserRatings(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionId) return;
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      // In a real app, userId would come from auth context
      const userId = 1; // Mock user ID for demonstration
      
      await hackathonApi.submitReview(
        parseInt(submissionId),
        userId,
        userRatings,
        userComment
      );
      
      // Refresh reviews after successful submission
      const updatedReviews = await hackathonApi.getReviews(parseInt(submissionId));
      setReviews(updatedReviews);
      
      // Reset form
      setUserRatings({
        innovation: 0,
        implementation: 0,
        impact: 0,
        presentation: 0
      });
      setUserComment('');
      
      // Switch to reviews tab to show the new review
      setActiveTab('reviews');
      
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate overall rating from user inputs
  const userOverallRating = Object.values(userRatings).reduce((sum, rating) => sum + rating, 0) / 4;

  if (loading) {
    return <div className="loading-container">Loading submission data...</div>;
  }

  if (error || !submission) {
    return <div className="error-container">{error || 'Submission not found'}</div>;
  }

  return (
    <div className="review-container">
      <div className="submission-header">
        <div className="submission-title-section">
          <Link to="/active-hackathon/submissions" className="back-link">← Back to Submissions</Link>
          <h1>{submission.title}</h1>
          <p className="team-name">by {submission.teamName}</p>
          <div className="submission-meta">
            <span className="track-badge">{submission.trackName}</span>
            {submission.avgRating && (
              <span className="rating-badge">
                {submission.avgRating.overall.toFixed(1)} ({submission.reviewCount} reviews)
              </span>
            )}
            <span className="date-badge">
              Submitted on {new Date(submission.submissionDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="submission-actions">
          {submission.demoUrl && (
            <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="demo-button">
              Try Demo
            </a>
          )}
          {submission.submissionUrl && (
            <a href={submission.submissionUrl} target="_blank" rel="noopener noreferrer" className="repo-button">
              View Repository
            </a>
          )}
        </div>
      </div>

      <div className="tab-navigation">
        <button 
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Project Details
        </button>
        <button 
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="project-details-tab">
          <div className="project-screenshot">
            {submission.screenshotUrls && submission.screenshotUrls.length > 0 ? (
              <img 
                src={submission.screenshotUrls[0]} 
                alt={`${submission.title} screenshot`} 
                className="main-screenshot" 
              />
            ) : (
              <div className="screenshot-placeholder">{/* Placeholder for main screenshot */}</div>
            )}
          </div>
          
          <div className="project-description">
            <h2>About this Project</h2>
            <p className="long-description">{submission.longDescription || submission.description}</p>
          </div>
          
          <div className="project-details-grid">
            {submission.teamMembers && submission.teamMembers.length > 0 && (
              <div className="team-info">
                <h3>Team Members</h3>
                <ul>
                  {submission.teamMembers.map((member, index) => (
                    <li key={index}>{member}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {submission.technologies && submission.technologies.length > 0 && (
              <div className="tech-info">
                <h3>Technologies Used</h3>
                <div className="tech-tags">
                  {submission.technologies.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {submission.screenshotUrls && submission.screenshotUrls.length > 1 && (
            <div className="screenshot-gallery">
              <h3>Screenshots</h3>
              <div className="gallery-grid">
                {submission.screenshotUrls.slice(1).map((url, index) => (
                  <div key={index} className="gallery-item">
                    <img src={url} alt={`${submission.title} screenshot ${index + 2}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="reviews-tab">
          {submission.avgRating && (
            <div className="reviews-summary">
              <h2>Review Summary</h2>
              <div className="rating-categories">
                <div className="rating-category">
                  <span className="category-name">Innovation</span>
                  <div className="rating-bar">
                    <div 
                      className="rating-fill" 
                      style={{ width: `${(submission.avgRating.innovation / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="category-score">{submission.avgRating.innovation.toFixed(1)}</span>
                </div>
                <div className="rating-category">
                  <span className="category-name">Implementation</span>
                  <div className="rating-bar">
                    <div 
                      className="rating-fill" 
                      style={{ width: `${(submission.avgRating.implementation / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="category-score">{submission.avgRating.implementation.toFixed(1)}</span>
                </div>
                <div className="rating-category">
                  <span className="category-name">Impact</span>
                  <div className="rating-bar">
                    <div 
                      className="rating-fill" 
                      style={{ width: `${(submission.avgRating.impact / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="category-score">{submission.avgRating.impact.toFixed(1)}</span>
                </div>
                <div className="rating-category">
                  <span className="category-name">Presentation</span>
                  <div className="rating-bar">
                    <div 
                      className="rating-fill" 
                      style={{ width: `${(submission.avgRating.presentation / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="category-score">{submission.avgRating.presentation.toFixed(1)}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="submit-review">
            <h2>Submit Your Review</h2>
            {submitError && <p className="error-message">{submitError}</p>}
            <form onSubmit={handleSubmitReview}>
              <div className="rating-inputs">
                <div className="rating-input">
                  <label>Innovation</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        className={star <= userRatings.innovation ? 'star active' : 'star'}
                        onClick={() => handleRatingChange('innovation', star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rating-input">
                  <label>Implementation</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        className={star <= userRatings.implementation ? 'star active' : 'star'}
                        onClick={() => handleRatingChange('implementation', star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rating-input">
                  <label>Impact</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        className={star <= userRatings.impact ? 'star active' : 'star'}
                        onClick={() => handleRatingChange('impact', star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rating-input">
                  <label>Presentation</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button 
                        key={star}
                        type="button"
                        className={star <= userRatings.presentation ? 'star active' : 'star'}
                        onClick={() => handleRatingChange('presentation', star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="overall-rating">
                <span>Overall Rating: </span>
                <span className="overall-score">
                  {userOverallRating > 0 ? userOverallRating.toFixed(1) : '-'}
                </span>
              </div>
              
              <div className="comment-input">
                <label htmlFor="comment">Your Feedback</label>
                <textarea
                  id="comment"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder="Share your thoughts on this project..."
                  rows={4}
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="submit-button"
                disabled={userOverallRating === 0 || !userComment.trim() || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
          
          <div className="existing-reviews">
            <h2>Reviews</h2>
            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map(review => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <span className="reviewer-name">{review.userName}</span>
                      <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                    </div>
                    <div className="review-ratings">
                      <div className="mini-rating">
                        <span>Innovation:</span>
                        <span className="mini-stars">
                          {'★'.repeat(review.ratings.innovation)}
                          {'☆'.repeat(5 - review.ratings.innovation)}
                        </span>
                      </div>
                      <div className="mini-rating">
                        <span>Implementation:</span>
                        <span className="mini-stars">
                          {'★'.repeat(review.ratings.implementation)}
                          {'☆'.repeat(5 - review.ratings.implementation)}
                        </span>
                      </div>
                      <div className="mini-rating">
                        <span>Impact:</span>
                        <span className="mini-stars">
                          {'★'.repeat(review.ratings.impact)}
                          {'☆'.repeat(5 - review.ratings.impact)}
                        </span>
                      </div>
                      <div className="mini-rating">
                        <span>Presentation:</span>
                        <span className="mini-stars">
                          {'★'.repeat(review.ratings.presentation)}
                          {'☆'.repeat(5 - review.ratings.presentation)}
                        </span>
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-reviews">No reviews yet. Be the first to review this project!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewPage;

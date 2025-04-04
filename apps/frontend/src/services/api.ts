import axios from 'axios';
import { Hackathon, Track, Submission, Review, Sponsor } from '../types/hackathon';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service for hackathon data
export const hackathonApi = {
  // Get active hackathon details
  getActiveHackathon: async (): Promise<Hackathon> => {
    const response = await api.get('/hackathons/active');
    return response.data;
  },

  // Get tracks for active hackathon
  getTracks: async (): Promise<Track[]> => {
    const response = await api.get('/hackathons/active/tracks');
    return response.data;
  },

  // Get submissions for active hackathon
  getSubmissions: async (trackId?: number): Promise<Submission[]> => {
    const params = trackId ? { trackId } : {};
    const response = await api.get('/hackathons/active/submissions', { params });
    return response.data;
  },

  // Get a specific submission by ID
  getSubmission: async (id: number): Promise<Submission> => {
    const response = await api.get(`/hackathons/submissions/${id}`);
    return response.data;
  },

  // Get reviews for a submission
  getReviews: async (submissionId: number): Promise<Review[]> => {
    const response = await api.get(`/hackathons/submissions/${submissionId}/reviews`);
    return response.data;
  },

  // Submit a review for a submission
  submitReview: async (submissionId: number, userId: number, ratings: { innovation: number; implementation: number; impact: number; presentation: number }, comment: string): Promise<Review> => {
    const response = await api.post(`/hackathons/submissions/${submissionId}/reviews`, {
      userId,
      ratings,
      comment,
    });
    return response.data;
  },

  // Get sponsors for active hackathon
  getSponsors: async (): Promise<Sponsor[]> => {
    const response = await api.get('/hackathons/active/sponsors');
    return response.data;
  },
};

export default api;

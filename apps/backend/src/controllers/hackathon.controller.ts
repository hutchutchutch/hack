import { Request, Response } from 'express';
import HackathonModel from '../models/hackathon';

class HackathonController {
  // Get active hackathon
  async getActiveHackathon(req: Request, res: Response): Promise<void> {
    try {
      const hackathon = await HackathonModel.getActiveHackathon();
      
      if (!hackathon) {
        res.status(404).json({ message: 'No active hackathon found' });
        return;
      }
      
      res.json(hackathon);
    } catch (error) {
      console.error('Error fetching active hackathon:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get tracks for active hackathon
  async getTracks(req: Request, res: Response): Promise<void> {
    try {
      const hackathon = await HackathonModel.getActiveHackathon();
      
      if (!hackathon) {
        res.status(404).json({ message: 'No active hackathon found' });
        return;
      }
      
      const tracks = await HackathonModel.getTracksForHackathon(hackathon.id);
      res.json(tracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get submissions for active hackathon
  async getSubmissions(req: Request, res: Response): Promise<void> {
    try {
      const hackathon = await HackathonModel.getActiveHackathon();
      
      if (!hackathon) {
        res.status(404).json({ message: 'No active hackathon found' });
        return;
      }
      
      const trackId = req.query.trackId ? Number(req.query.trackId) : undefined;
      const submissions = await HackathonModel.getSubmissionsForHackathon(hackathon.id, trackId);
      res.json(submissions);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get a specific submission by ID
  async getSubmission(req: Request, res: Response): Promise<void> {
    try {
      const submissionId = Number(req.params.id);
      const submission = await HackathonModel.getSubmissionById(submissionId);
      
      if (!submission) {
        res.status(404).json({ message: 'Submission not found' });
        return;
      }
      
      res.json(submission);
    } catch (error) {
      console.error('Error fetching submission:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get reviews for a submission
  async getReviews(req: Request, res: Response): Promise<void> {
    try {
      const submissionId = Number(req.params.id);
      const reviews = await HackathonModel.getReviewsForSubmission(submissionId);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Create a review for a submission
  async createReview(req: Request, res: Response): Promise<void> {
    try {
      const submissionId = Number(req.params.id);
      const userId = req.body.userId; // In a real app, this would come from auth middleware
      
      const { ratings, comment } = req.body;
      
      // Validate request body
      if (!ratings || !comment) {
        res.status(400).json({ message: 'Ratings and comment are required' });
        return;
      }
      
      // Check all required ratings are present
      const requiredRatings = ['innovation', 'implementation', 'impact', 'presentation'];
      const missingRatings = requiredRatings.filter(r => !ratings[r]);
      
      if (missingRatings.length > 0) {
        res.status(400).json({ 
          message: `Missing ratings: ${missingRatings.join(', ')}` 
        });
        return;
      }
      
      const review = await HackathonModel.createReview(submissionId, userId, {
        date: new Date().toISOString(),
        ratings,
        comment,
      });
      
      res.status(201).json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get sponsors for active hackathon
  async getSponsors(req: Request, res: Response): Promise<void> {
    try {
      const hackathon = await HackathonModel.getActiveHackathon();
      
      if (!hackathon) {
        res.status(404).json({ message: 'No active hackathon found' });
        return;
      }
      
      const sponsors = await HackathonModel.getSponsorsForHackathon(hackathon.id);
      res.json(sponsors);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

export default new HackathonController();

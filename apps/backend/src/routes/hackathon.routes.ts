import { Router } from 'express';
import HackathonController from '../controllers/hackathon.controller';

const router = Router();

// Get active hackathon details
router.get('/active', HackathonController.getActiveHackathon);

// Get tracks for active hackathon
router.get('/active/tracks', HackathonController.getTracks);

// Get submissions for active hackathon
router.get('/active/submissions', HackathonController.getSubmissions);

// Get a specific submission by ID
router.get('/submissions/:id', HackathonController.getSubmission);

// Get reviews for a submission
router.get('/submissions/:id/reviews', HackathonController.getReviews);

// Create a review for a submission
router.post('/submissions/:id/reviews', HackathonController.createReview);

// Get sponsors for active hackathon
router.get('/active/sponsors', HackathonController.getSponsors);

export default router;

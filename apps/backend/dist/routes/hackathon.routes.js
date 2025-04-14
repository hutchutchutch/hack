"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hackathon_controller_1 = require("../controllers/hackathon.controller");
const router = (0, express_1.Router)();
// Get active hackathon details
router.get('/active', hackathon_controller_1.default.getActiveHackathon);
// Get tracks for active hackathon
router.get('/active/tracks', hackathon_controller_1.default.getTracks);
// Get submissions for active hackathon
router.get('/active/submissions', hackathon_controller_1.default.getSubmissions);
// Get a specific submission by ID
router.get('/submissions/:id', hackathon_controller_1.default.getSubmission);
// Get reviews for a submission
router.get('/submissions/:id/reviews', hackathon_controller_1.default.getReviews);
// Create a review for a submission
router.post('/submissions/:id/reviews', hackathon_controller_1.default.createReview);
// Get sponsors for active hackathon
router.get('/active/sponsors', hackathon_controller_1.default.getSponsors);
exports.default = router;

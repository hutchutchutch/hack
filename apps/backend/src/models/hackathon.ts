import PostgresConnection from '../config/postgres';

const db = PostgresConnection.getInstance().getDB();

export interface Track {
  id: number;
  trackName: string;
  description?: string;
  prizes?: string;
  hackathonId: number;
  submissionCount?: number;
}

export interface Sponsor {
  id: number;
  name: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  logoUrl: string;
  description?: string;
  websiteUrl?: string;
  perks?: string[];
}

export interface Submission {
  id: number;
  projectName: string;
  teamName: string;
  teamMembers?: string[];
  trackId: number;
  trackName: string;
  description: string;
  longDescription?: string;
  submissionDate: string;
  submissionUrl?: string;
  demoUrl?: string;
  thumbnailUrl?: string;
  screenshotUrls?: string[];
  technologies?: string[];
  avgRating?: {
    overall: number;
    innovation: number;
    implementation: number;
    impact: number;
    presentation: number;
  };
  reviewCount?: number;
}

export interface Review {
  id: number;
  hackerId: number;
  hackerName: string;
  projectId: number;
  submissionDate: string;
  ratings: {
    innovation: number;
    implementation: number;
    impact: number;
    presentation: number;
  };
  comment: string;
}

export interface Hackathon {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'past';
  submissionCount?: number;
  hackerCount?: number;
  tracks?: Track[];
  submissions?: Submission[];
  sponsors?: Sponsor[];
}

class HackathonModel {
  // Get active hackathon with all related data
  async getActiveHackathon(): Promise<Hackathon | null> {
    try {
      // Find active hackathon
      const hackathon = await db.oneOrNone(`
        SELECT * FROM hackathons 
        WHERE status = 'active' 
        LIMIT 1
      `);

      if (!hackathon) {
        return null;
      }

      // Get tracks for the hackathon
      const tracks = await this.getTracksForHackathon(hackathon.id);

      // Return formatted hackathon data
      return {
        id: hackathon.id,
        title: hackathon.title,
        description: hackathon.description,
        startDate: hackathon.start_date,
        endDate: hackathon.end_date,
        status: hackathon.status,
        submissionCount: await this.getSubmissionCountForHackathon(hackathon.id),
        hackerCount: hackathon.hacker_count,
        tracks: tracks,
      };
    } catch (error) {
      console.error('Error getting active hackathon:', error);
      throw error;
    }
  }

  // Get tracks for a hackathon
  async getTracksForHackathon(hackathonId: number): Promise<Track[]> {
    try {
      // Get tracks from database
      const tracks = await db.manyOrNone(`
        SELECT 
          ht.id, 
          ht.track_name, 
          ht.prizes, 
          ht.hackathon_id,
          COUNT(p.id) as submission_count
        FROM 
          hackathon_tracks ht
        LEFT JOIN
          projects p ON p.track_id = ht.id
        WHERE 
          ht.hackathon_id = $1
        GROUP BY
          ht.id
        ORDER BY 
          ht.id
      `, [hackathonId]);

      // Format track data
      return tracks.map(track => ({
        id: track.id,
        trackName: track.track_name,
        prizes: track.prizes,
        hackathonId: track.hackathon_id,
        submissionCount: parseInt(track.submission_count || '0'),
      }));
    } catch (error) {
      console.error('Error getting tracks for hackathon:', error);
      throw error;
    }
  }

  // Get submissions for a hackathon with optional track filter
  async getSubmissionsForHackathon(hackathonId: number, trackId?: number): Promise<Submission[]> {
    try {
      // Build query with optional track filter
      let query = `
        SELECT 
          p.id, 
          p.project_name,

          p.team_name,
          p.team_members,
          p.track_id,
          ht.track_name,
          p.description,
          p.long_description,
          p.submission_date,
          p.submission_url,
          p.demo_url,
          p.thumbnail_url,
          p.screenshot_urls,
          p.tech_tags,
          COUNT(r.id) as review_count,
          AVG(r.innovation_rating) as avg_innovation,
          AVG(r.implementation_rating) as avg_implementation,
          AVG(r.impact_rating) as avg_impact,
          AVG(r.presentation_rating) as avg_presentation,
          AVG((r.innovation_rating + r.implementation_rating + r.impact_rating + r.presentation_rating)/4) as avg_overall
        FROM 
          projects p
        INNER JOIN
          hackathon_tracks ht ON p.track_id = ht.id
        LEFT JOIN
          reviews r ON r.project_id = p.id
        WHERE 
          p.hackathon_id = $1
      `;

      const queryParams = [hackathonId];

      // Add track filter if provided
      if (trackId) {
        query += ` AND p.track_id = $2`;
        queryParams.push(trackId);
      }

      // Group and order results
      query += `
        GROUP BY
          p.id, ht.track_name
        ORDER BY 
          p.submission_date DESC
      `;

      // Execute query
      const submissions = await db.manyOrNone(query, queryParams);

      // Format submission data
      return submissions.map(sub => {
        const reviewCount = parseInt(sub.review_count || '0');
        
        // Handle ratings
        let avgRating = null;
        if (reviewCount > 0) {
          avgRating = {
            overall: parseFloat(sub.avg_overall),
            innovation: parseFloat(sub.avg_innovation),
            implementation: parseFloat(sub.avg_implementation),
            impact: parseFloat(sub.avg_impact),
            presentation: parseFloat(sub.avg_presentation)
          };
        }

        return {
          id: sub.id,
          projectName: sub.project_name,
          teamName: sub.team_name,
          teamMembers: sub.team_members,
          trackId: sub.track_id,
          trackName: sub.track_name,
          description: sub.description,
          longDescription: sub.long_description,
          submissionDate: sub.submission_date,
          submissionUrl: sub.submission_url,
          demoUrl: sub.demo_url,
          thumbnailUrl: sub.thumbnail_url,
          screenshotUrls: sub.screenshot_urls,
          technologies: sub.tech_tags,
          avgRating: avgRating,
          reviewCount: reviewCount,
        };
      });
    } catch (error) {
      console.error('Error getting submissions for hackathon:', error);
      throw error;
    }
  }

  // Get a specific submission by ID
  async getSubmissionById(submissionId: number): Promise<Submission | null> {
    try {
      const submission = await db.oneOrNone(`
        SELECT 
          p.id, 
          p.project_name, 
          p.team_name,
          p.team_members,
          p.track_id,
          ht.track_name,
          p.description,
          p.long_description,
          p.submission_date,
          p.submission_url,
          p.demo_url,
          p.thumbnail_url,
          p.screenshot_urls,
          p.tech_tags,
          COUNT(r.id) as review_count,
          AVG(r.innovation_rating) as avg_innovation,
          AVG(r.implementation_rating) as avg_implementation,
          AVG(r.impact_rating) as avg_impact,
          AVG(r.presentation_rating) as avg_presentation,
          AVG((r.innovation_rating + r.implementation_rating + r.impact_rating + r.presentation_rating)/4) as avg_overall
        FROM 
          projects p
        INNER JOIN
          hackathon_tracks ht ON p.track_id = ht.id
        LEFT JOIN
          reviews r ON r.project_id = p.id
        WHERE 
          p.id = $1
        GROUP BY
          p.id, ht.track_name
      `, [submissionId]);

      if (!submission) {
        return null;
      }

      // Calculate review count and average ratings
      const reviewCount = parseInt(submission.review_count || '0');
      
      // Handle ratings
      let avgRating = null;
      if (reviewCount > 0) {
        avgRating = {
          overall: parseFloat(submission.avg_overall),
          innovation: parseFloat(submission.avg_innovation),
          implementation: parseFloat(submission.avg_implementation),
          impact: parseFloat(submission.avg_impact),
          presentation: parseFloat(submission.avg_presentation)
        };
      }

      // Format and return submission
      return {
        id: submission.id,
        projectName: submission.project_name,
        teamName: submission.team_name,
        teamMembers: submission.team_members,
        trackId: submission.track_id,
        trackName: submission.track_name,
        description: submission.description,
        longDescription: submission.long_description,
        submissionDate: submission.submission_date,
        submissionUrl: submission.submission_url,
        demoUrl: submission.demo_url,
        thumbnailUrl: submission.thumbnail_url,
        screenshotUrls: submission.screenshot_urls,
        technologies: submission.tech_tags,
        avgRating: avgRating,
        reviewCount: reviewCount,
      };
    } catch (error) {
      console.error('Error getting submission by ID:', error);
      throw error;
    }
  }

  // Get reviews for a submission
  async getReviewsForSubmission(submissionId: number): Promise<Review[]> {
    try {
      const reviews = await db.manyOrNone(`
        SELECT 
          r.id,
          r.hacker_id,
          h.name as hacker_name,
          r.project_id,
          r.comment,
          r.innovation_rating,
          r.implementation_rating,
          r.impact_rating,
          r.presentation_rating,
          r.submission_date
        FROM 
          reviews r
        INNER JOIN
          hackers h ON r.hacker_id = h.id
        WHERE 
          r.project_id = $1
        ORDER BY 
          r.submission_date DESC
      `, [submissionId]);

      // Format and return reviews
      return reviews.map(review => ({
        id: review.id,
        hackerId: review.hacker_id,
        hackerName: review.hacker_name,
        projectId: review.project_id,
        submissionDate: review.submission_date,
        ratings: {
          innovation: parseFloat(review.innovation_rating),
          implementation: parseFloat(review.implementation_rating),
          impact: parseFloat(review.impact_rating),
          presentation: parseFloat(review.presentation_rating),
        },
        comment: review.comment,
      }));
    } catch (error) {
      console.error('Error getting reviews for submission:', error);
      throw error;
    }
  }

  // Create a new review for a submission
  async createReview(
    projectId: number, 
    hackerId: number, 
    review: { 
      ratings: { 
        innovation: number; 
        implementation: number; 
        impact: number; 
        presentation: number; 
      }; 
      comment: string; 
    }
  ): Promise<Review> {
    try {
      // Insert review
      const newReview = await db.one(`
        INSERT INTO reviews (
          project_id,
          hacker_id,
          comment,
          innovation_rating,
          implementation_rating,
          impact_rating,
          presentation_rating
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING 
          id, 
          project_id, 
          hacker_id, 
          comment, 
          innovation_rating, 
          implementation_rating, 
          impact_rating, 
          presentation_rating, 
          submission_date
      `, [
        projectId,
        hackerId,
        review.comment,
        review.ratings.innovation,
        review.ratings.implementation,
        review.ratings.impact,
        review.ratings.presentation
      ]);

      // Get hacker name for the review
      const hacker = await db.one(`
        SELECT name FROM hackers WHERE id = $1
      `, [hackerId]);

      // Format and return the created review
      return {
        id: newReview.id,
        hackerId: newReview.hacker_id,
        hackerName: hacker.name,
        projectId: newReview.project_id,
        submissionDate: newReview.submission_date,
        ratings: {
          innovation: parseFloat(newReview.innovation_rating),
          implementation: parseFloat(newReview.implementation_rating),
          impact: parseFloat(newReview.impact_rating),
          presentation: parseFloat(newReview.presentation_rating),
        },
        comment: newReview.comment,
      };
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Get sponsors for a hackathon
  async getSponsorsForHackathon(hackathonId: number): Promise<Sponsor[]> {
    try {
      const sponsors = await db.manyOrNone(`
        SELECT 
          a.id,
          a.name,
          a.tier,
          a.logo_url as logo_url,
          a.description,
          a.website_url
        FROM 
          allies a
        INNER JOIN
          ally_hackathons ah ON a.id = ah.ally_id
        WHERE 
          ah.hackathon_id = $1
        ORDER BY 
          CASE 
            WHEN a.tier = 'platinum' THEN 1 
            WHEN a.tier = 'gold' THEN 2 
            WHEN a.tier = 'silver' THEN 3 
            WHEN a.tier = 'bronze' THEN 4 
            ELSE 5 
          END
      `, [hackathonId]);

      // Format and return sponsors
      return sponsors.map(sponsor => ({
        id: sponsor.id,
        name: sponsor.name,
        tier: sponsor.tier,
        logoUrl: sponsor.logo_url,
        description: sponsor.description,
        websiteUrl: sponsor.website_url,
      }));
    } catch (error) {
      console.error('Error getting sponsors for hackathon:', error);
      throw error;
    }
  }

  // Get submission count for a hackathon
  private async getSubmissionCountForHackathon(hackathonId: number): Promise<number> {
    try {
      const result = await db.one(`
        SELECT COUNT(*) as count 
        FROM projects 
        WHERE hackathon_id = $1
      `, [hackathonId]);
      
      return parseInt(result.count);
    } catch (error) {
      console.error('Error getting submission count:', error);
      return 0;
    }
  }
}

export default new HackathonModel();
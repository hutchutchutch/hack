import Neo4jConnection from '../config/neo4j.ts';
import { Record, Node } from 'neo4j-driver';

export interface Track {
  id: number;
  title: string;
  description: string;
  prizes: string[];
  requirements: string[];
  submissionCount: number;
}

export interface Sponsor {
  id: number;
  name: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  logo: string;
  description: string;
  websiteUrl: string;
  perks?: string[];
}

export interface Submission {
  id: number;
  title: string;
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
  userId: number;
  userName: string;
  submissionId: number;
  date: string;
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
  isActive: boolean;
  submissionCount: number;
  participantCount: number;
  tracks: Track[];
  submissions?: Submission[];
  sponsors?: Sponsor[];
}

class HackathonModel {
  // Get active hackathon with all related data
  async getActiveHackathon(): Promise<Hackathon | null> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      const result = await session.run(
        `MATCH (h:Hackathon {isActive: true})
         RETURN h`
      );

      if (result.records.length === 0) {
        return null;
      }

      const hackathon = this.recordToHackathon(result.records[0]);

      // Get tracks, submissions count, and participant count
      const [tracks, submissionCount, participantCount] = await Promise.all([
        this.getTracksForHackathon(hackathon.id),
        this.getSubmissionCountForHackathon(hackathon.id),
        this.getParticipantCountForHackathon(hackathon.id),
      ]);

      return {
        ...hackathon,
        tracks,
        submissionCount,
        participantCount,
      };
    } finally {
      session.close();
    }
  }

  // Get tracks for a hackathon
  async getTracksForHackathon(hackathonId: number): Promise<Track[]> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      const result = await session.run(
        `MATCH (h:Hackathon {id: $hackathonId})-[:HAS_TRACK]->(t:Track)
         OPTIONAL MATCH (t)<-[:BELONGS_TO_TRACK]-(s:Submission)
         RETURN t, count(s) as submissionCount
         ORDER BY t.id`,
        { hackathonId }
      );

      return result.records.map(record => {
        const trackNode = record.get('t') as Node;
        const track = trackNode.properties as any;

        return {
          id: track.id.toNumber(),
          title: track.title,
          description: track.description,
          prizes: track.prizes,
          requirements: track.requirements,
          submissionCount: record.get('submissionCount').toNumber(),
        };
      });
    } finally {
      session.close();
    }
  }

  // Get submissions for a hackathon with optional track filter
  async getSubmissionsForHackathon(hackathonId: number, trackId?: number): Promise<Submission[]> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      let query = `
        MATCH (h:Hackathon {id: $hackathonId})<-[:SUBMITTED_TO]-(s:Submission)-[:BELONGS_TO_TRACK]->(t:Track)
        MATCH (s)<-[:CREATED]-(u:User)
      `;

      if (trackId) {
        query += ` WHERE t.id = $trackId`;
      }

      query += `
        OPTIONAL MATCH (s)<-[:REVIEWS]-(r:Review)
        WITH s, t, u, count(r) as reviewCount,
             avg(r.innovationRating) as avgInnovation,
             avg(r.implementationRating) as avgImplementation,
             avg(r.impactRating) as avgImpact,
             avg(r.presentationRating) as avgPresentation
        RETURN s, t.id as trackId, t.title as trackName, reviewCount, 
               avg(avgInnovation, avgImplementation, avgImpact, avgPresentation) as avgOverall,
               avgInnovation, avgImplementation, avgImpact, avgPresentation,
               collect(u.name) as teamMembers
        ORDER BY s.submissionDate DESC
      `;

      const result = await session.run(query, { hackathonId, trackId });

      return result.records.map(record => {
        const submissionNode = record.get('s') as Node;
        const submission = submissionNode.properties as any;
        const teamMembers = record.get('teamMembers') as string[];
        const reviewCount = record.get('reviewCount').toNumber();
        
        // Handle ratings
        let avgRating = null;
        if (reviewCount > 0) {
          avgRating = {
            overall: record.get('avgOverall'),
            innovation: record.get('avgInnovation'),
            implementation: record.get('avgImplementation'),
            impact: record.get('avgImpact'),
            presentation: record.get('avgPresentation')
          };
        }

        return {
          id: submission.id.toNumber(),
          title: submission.title,
          teamName: submission.teamName,
          teamMembers: teamMembers,
          trackId: record.get('trackId').toNumber(),
          trackName: record.get('trackName'),
          description: submission.description,
          longDescription: submission.longDescription,
          submissionDate: submission.submissionDate,
          submissionUrl: submission.submissionUrl,
          demoUrl: submission.demoUrl,
          thumbnailUrl: submission.thumbnailUrl,
          screenshotUrls: submission.screenshotUrls,
          technologies: submission.technologies,
          avgRating: avgRating,
          reviewCount: reviewCount,
        };
      });
    } finally {
      session.close();
    }
  }

  // Get a specific submission by ID
  async getSubmissionById(submissionId: number): Promise<Submission | null> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      const result = await session.run(
        `MATCH (s:Submission {id: $submissionId})-[:BELONGS_TO_TRACK]->(t:Track)
         MATCH (s)<-[:CREATED]-(u:User)
         OPTIONAL MATCH (s)<-[:REVIEWS]-(r:Review)
         WITH s, t, collect(u.name) as teamMembers, count(r) as reviewCount,
              avg(r.innovationRating) as avgInnovation,
              avg(r.implementationRating) as avgImplementation,
              avg(r.impactRating) as avgImpact,
              avg(r.presentationRating) as avgPresentation
         RETURN s, t.id as trackId, t.title as trackName, teamMembers, reviewCount, 
                avg(avgInnovation, avgImplementation, avgImpact, avgPresentation) as avgOverall,
                avgInnovation, avgImplementation, avgImpact, avgPresentation`,
        { submissionId }
      );

      if (result.records.length === 0) {
        return null;
      }

      const record = result.records[0];
      const submissionNode = record.get('s') as Node;
      const submission = submissionNode.properties as any;
      const teamMembers = record.get('teamMembers') as string[];
      const reviewCount = record.get('reviewCount').toNumber();
      
      // Handle ratings
      let avgRating = null;
      if (reviewCount > 0) {
        avgRating = {
          overall: record.get('avgOverall'),
          innovation: record.get('avgInnovation'),
          implementation: record.get('avgImplementation'),
          impact: record.get('avgImpact'),
          presentation: record.get('avgPresentation')
        };
      }

      return {
        id: submission.id.toNumber(),
        title: submission.title,
        teamName: submission.teamName,
        teamMembers: teamMembers,
        trackId: record.get('trackId').toNumber(),
        trackName: record.get('trackName'),
        description: submission.description,
        longDescription: submission.longDescription,
        submissionDate: submission.submissionDate,
        submissionUrl: submission.submissionUrl,
        demoUrl: submission.demoUrl,
        thumbnailUrl: submission.thumbnailUrl,
        screenshotUrls: submission.screenshotUrls,
        technologies: submission.technologies,
        avgRating: avgRating,
        reviewCount: reviewCount,
      };
    } finally {
      session.close();
    }
  }

  // Get reviews for a submission
  async getReviewsForSubmission(submissionId: number): Promise<Review[]> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      const result = await session.run(
        `MATCH (s:Submission {id: $submissionId})<-[:REVIEWS]-(r:Review)<-[:CREATED]-(u:User)
         RETURN r, u.id as userId, u.name as userName, r.date as date
         ORDER BY r.date DESC`,
        { submissionId }
      );

      return result.records.map(record => {
        const reviewNode = record.get('r') as Node;
        const review = reviewNode.properties as any;

        return {
          id: review.id.toNumber(),
          userId: record.get('userId').toNumber(),
          userName: record.get('userName'),
          submissionId: submissionId,
          date: record.get('date'),
          ratings: {
            innovation: review.innovationRating.toNumber(),
            implementation: review.implementationRating.toNumber(),
            impact: review.impactRating.toNumber(),
            presentation: review.presentationRating.toNumber(),
          },
          comment: review.comment,
        };
      });
    } finally {
      session.close();
    }
  }

  // Create a new review for a submission
  async createReview(submissionId: number, userId: number, review: Omit<Review, 'id' | 'userId' | 'submissionId' | 'userName'>): Promise<Review> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      const result = await session.run(
        `MATCH (s:Submission {id: $submissionId}), (u:User {id: $userId})
         CREATE (r:Review {
           id: randomUUID(),
           date: datetime(),
           innovationRating: $innovationRating,
           implementationRating: $implementationRating,
           impactRating: $impactRating,
           presentationRating: $presentationRating,
           comment: $comment
         })
         CREATE (u)-[:CREATED]->(r)-[:REVIEWS]->(s)
         RETURN r, u.name as userName`,
        {
          submissionId,
          userId,
          innovationRating: review.ratings.innovation,
          implementationRating: review.ratings.implementation,
          impactRating: review.ratings.impact,
          presentationRating: review.ratings.presentation,
          comment: review.comment,
        }
      );

      const record = result.records[0];
      const reviewNode = record.get('r') as Node;
      const reviewData = reviewNode.properties as any;

      return {
        id: reviewData.id,
        userId,
        userName: record.get('userName'),
        submissionId,
        date: reviewData.date,
        ratings: {
          innovation: reviewData.innovationRating.toNumber(),
          implementation: reviewData.implementationRating.toNumber(),
          impact: reviewData.impactRating.toNumber(),
          presentation: reviewData.presentationRating.toNumber(),
        },
        comment: reviewData.comment,
      };
    } finally {
      session.close();
    }
  }

  // Get sponsors for a hackathon
  async getSponsorsForHackathon(hackathonId: number): Promise<Sponsor[]> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      const result = await session.run(
        `MATCH (h:Hackathon {id: $hackathonId})-[:HAS_SPONSOR]->(s:Sponsor)
         RETURN s
         ORDER BY 
           CASE s.tier 
             WHEN 'platinum' THEN 1 
             WHEN 'gold' THEN 2 
             WHEN 'silver' THEN 3 
             WHEN 'bronze' THEN 4 
             ELSE 5 
           END`,
        { hackathonId }
      );

      return result.records.map(record => {
        const sponsorNode = record.get('s') as Node;
        const sponsor = sponsorNode.properties as any;

        return {
          id: sponsor.id.toNumber(),
          name: sponsor.name,
          tier: sponsor.tier,
          logo: sponsor.logo,
          description: sponsor.description,
          websiteUrl: sponsor.websiteUrl,
          perks: sponsor.perks,
        };
      });
    } finally {
      session.close();
    }
  }

  // Get submission count for a hackathon
  private async getSubmissionCountForHackathon(hackathonId: number): Promise<number> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      const result = await session.run(
        `MATCH (h:Hackathon {id: $hackathonId})<-[:SUBMITTED_TO]-(s:Submission)
         RETURN count(s) as count`,
        { hackathonId }
      );

      return result.records[0].get('count').toNumber();
    } finally {
      session.close();
    }
  }

  // Get participant count for a hackathon
  private async getParticipantCountForHackathon(hackathonId: number): Promise<number> {
    const session = Neo4jConnection.getInstance().getSession();

    try {
      const result = await session.run(
        `MATCH (h:Hackathon {id: $hackathonId})<-[:SUBMITTED_TO]-(s:Submission)<-[:CREATED]-(u:User)
         RETURN count(DISTINCT u) as count`,
        { hackathonId }
      );

      return result.records[0].get('count').toNumber();
    } finally {
      session.close();
    }
  }

  // Convert Neo4j record to Hackathon object
  private recordToHackathon(record: Record): Hackathon {
    const hackathonNode = record.get('h') as Node;
    const hackathon = hackathonNode.properties as any;

    return {
      id: hackathon.id.toNumber(),
      title: hackathon.title,
      description: hackathon.description,
      startDate: hackathon.startDate,
      endDate: hackathon.endDate,
      isActive: hackathon.isActive,
      submissionCount: 0, // Will be populated later
      participantCount: 0, // Will be populated later
      tracks: [], // Will be populated later
    };
  }
}

export default new HackathonModel();

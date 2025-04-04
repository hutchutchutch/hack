// Types matching the backend models

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

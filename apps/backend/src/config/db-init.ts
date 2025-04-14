import PostgresConnection from './postgres';

const db = PostgresConnection.getInstance().getDB();

// Database initialization function to create all tables
export async function initializeDatabase() {
  try {
    // Create tables in proper order (respecting foreign key constraints)
    
    // Hackathons Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS hackathons (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK (status IN ('upcoming', 'active', 'past')) NOT NULL,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        submission_deadline TIMESTAMP,
        prizes_total NUMERIC(10, 2),
        hacker_count INT DEFAULT 0
      );
    `);

    // Hackers Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS hackers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        avatar_url TEXT,
        manifesto TEXT,
        skills TEXT[],
        interests TEXT[],
        status TEXT CHECK (status IN ('Visitor', 'Member')) DEFAULT 'Visitor',
        membership_expires DATE
      );
    `);

    // Hacker Roles Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS hacker_roles (
        hacker_id INT REFERENCES hackers(id) ON DELETE CASCADE,
        role TEXT CHECK (role IN ('Hacker', 'Judge', 'Ambassador', 'Admin')),
        PRIMARY KEY (hacker_id, role)
      );
    `);

    // Hackathon Tracks Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS hackathon_tracks (
        id SERIAL PRIMARY KEY,
        hackathon_id INT REFERENCES hackathons(id) ON DELETE CASCADE,
        track_name TEXT NOT NULL,
        prizes TEXT
      );
    `);

    // Hackathon Registrations Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS hackathon_registrations (
        id SERIAL PRIMARY KEY,
        hackathon_id INT REFERENCES hackathons(id) ON DELETE CASCADE,
        hacker_id INT REFERENCES hackers(id) ON DELETE CASCADE,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (hackathon_id, hacker_id)
      );
    `);

    // Projects Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        hackathon_id INT REFERENCES hackathons(id) ON DELETE CASCADE,
        hacker_id INT REFERENCES hackers(id) ON DELETE CASCADE,
        track_id INT REFERENCES hackathon_tracks(id) ON DELETE SET NULL,
        project_name TEXT NOT NULL,
        description TEXT,
        long_description TEXT,
        media_assets JSONB,
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submission_url TEXT,
        demo_url TEXT,
        thumbnail_url TEXT,
        screenshot_urls TEXT[],
        tech_tags TEXT[],
        judges_rating NUMERIC(3,1),
        community_rating NUMERIC(3,1),
        combined_rating NUMERIC(3,1),
        team_name TEXT,
        team_members TEXT[]
      );
    `);

    // Project Likes Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS project_likes (
        id SERIAL PRIMARY KEY,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        hacker_id INT REFERENCES hackers(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (project_id, hacker_id)
      );
    `);

    // Reviews Table (previously called Testimonials)
    await db.none(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE,
        hacker_id INT REFERENCES hackers(id) ON DELETE SET NULL,
        comment TEXT NOT NULL,
        innovation_rating NUMERIC(3,1),
        implementation_rating NUMERIC(3,1),
        impact_rating NUMERIC(3,1),
        presentation_rating NUMERIC(3,1),
        submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pinned Testimonials Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS pinned_testimonials (
        hacker_id INT REFERENCES hackers(id) ON DELETE CASCADE,
        testimonial_id INT REFERENCES reviews(id) ON DELETE CASCADE,
        pinned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (hacker_id, testimonial_id)
      );
    `);

    // Allies (Sponsors) Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS allies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        mission_statement TEXT,
        featured_image_url TEXT,
        logo_url TEXT,
        tier TEXT CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze')),
        description TEXT,
        website_url TEXT,
        social_media_links JSONB,
        contact_links JSONB,
        discount_reference TEXT
      );
    `);

    // Many-to-Many Relationship: Allies sponsoring Hackathons
    await db.none(`
      CREATE TABLE IF NOT EXISTS ally_hackathons (
        ally_id INT REFERENCES allies(id) ON DELETE CASCADE,
        hackathon_id INT REFERENCES hackathons(id) ON DELETE CASCADE,
        PRIMARY KEY (ally_id, hackathon_id)
      );
    `);

    // Events Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        agenda TEXT,
        speaker TEXT,
        event_date TIMESTAMP NOT NULL,
        location TEXT,
        tags TEXT[],
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Event Attendance Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS event_attendance (
        id SERIAL PRIMARY KEY,
        event_id INT REFERENCES events(id) ON DELETE CASCADE,
        hacker_id INT REFERENCES hackers(id) ON DELETE CASCADE,
        attended_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (event_id, hacker_id)
      );
    `);

    // Blog Posts Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        short_description TEXT,
        body TEXT NOT NULL,
        featured_image_url TEXT,
        author_id INT REFERENCES hackers(id) ON DELETE SET NULL,
        published_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        category TEXT,
        tags TEXT[]
      );
    `);

    // Blog Post Comments Table
    await db.none(`
      CREATE TABLE IF NOT EXISTS blog_comments (
        id SERIAL PRIMARY KEY,
        blog_post_id INT REFERENCES blog_posts(id) ON DELETE CASCADE,
        hacker_id INT REFERENCES hackers(id) ON DELETE SET NULL,
        comment_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialization completed successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// Export initialization function
export default { initializeDatabase };
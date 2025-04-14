import PostgresConnection from './postgres';

const db = PostgresConnection.getInstance().getDB();

export async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');

    // First check if we already have data
    const existingHackathons = await db.oneOrNone('SELECT COUNT(*) as count FROM hackathons');
    if (existingHackathons && parseInt(existingHackathons.count) > 0) {
      console.log('Database already has data, skipping seed process');
      return true;
    }

    // Create a sample active hackathon
    const hackathon = await db.one(`
      INSERT INTO hackathons (
        title, description, status, start_date, end_date, 
        submission_deadline, prizes_total
      ) VALUES (
        'HackaSummer 2025', 
        'Our annual summer hackathon bringing together the brightest minds in tech.',
        'active',
        '2025-06-01 00:00:00',
        '2025-06-30 23:59:59',
        '2025-06-25 23:59:59',
        10000
      ) RETURNING id
    `);

    // Create tracks
    const webTrack = await db.one(`
      INSERT INTO hackathon_tracks (
        hackathon_id, track_name, prizes
      ) VALUES (
        $1,
        'Web Development',
        '1st Place: $3,000\\n2nd Place: $1,500\\n3rd Place: $500'
      ) RETURNING id
    `, [hackathon.id]);

    const aiTrack = await db.one(`
      INSERT INTO hackathon_tracks (
        hackathon_id, track_name, prizes
      ) VALUES (
        $1,
        'AI/ML',
        '1st Place: $3,000\\n2nd Place: $1,500\\n3rd Place: $500'
      ) RETURNING id
    `, [hackathon.id]);

    // Create sample hackers
    const hacker1 = await db.one(`
      INSERT INTO hackers (
        name, email, avatar_url, skills, status
      ) VALUES (
        'Jane Developer',
        'jane@example.com',
        'https://randomuser.me/api/portraits/women/44.jpg',
        ARRAY['JavaScript', 'React', 'Node.js'],
        'Member'
      ) RETURNING id
    `);

    const hacker2 = await db.one(`
      INSERT INTO hackers (
        name, email, avatar_url, skills, status
      ) VALUES (
        'John Coder',
        'john@example.com',
        'https://randomuser.me/api/portraits/men/32.jpg',
        ARRAY['Python', 'TensorFlow', 'React'],
        'Member'
      ) RETURNING id
    `);

    // Add hacker roles
    await db.none(`
      INSERT INTO hacker_roles (hacker_id, role) VALUES ($1, 'Hacker')
    `, [hacker1.id]);

    await db.none(`
      INSERT INTO hacker_roles (hacker_id, role) VALUES ($1, 'Hacker')
    `, [hacker2.id]);

    // Register hackers for hackathon
    await db.none(`
      INSERT INTO hackathon_registrations (hackathon_id, hacker_id)
      VALUES ($1, $2)
    `, [hackathon.id, hacker1.id]);
    
    await db.none(`
      INSERT INTO hackathon_registrations (hackathon_id, hacker_id)
      VALUES ($1, $2)
    `, [hackathon.id, hacker2.id]);

    // Create sample projects
    const project1 = await db.one(`
      INSERT INTO projects (
        hackathon_id, hacker_id, track_id, project_name, 
        description, long_description, team_name, team_members,
        tech_tags, submission_date
      ) VALUES (
        $1, $2, $3, 'EcoTracker',
        'A web app to track your carbon footprint and suggest improvements',
        'EcoTracker is a comprehensive web application designed to help individuals and households track their carbon footprint across various aspects of daily life. The app provides personalized suggestions for reducing environmental impact based on user behavior patterns and local sustainability options.',
        'Green Coders',
        ARRAY['Jane Developer', 'Sarah Designer'],
        ARRAY['React', 'Node.js', 'MongoDB', 'Chart.js'],
        '2025-06-20 14:30:00'
      ) RETURNING id
    `, [hackathon.id, hacker1.id, webTrack.id]);

    const project2 = await db.one(`
      INSERT INTO projects (
        hackathon_id, hacker_id, track_id, project_name, 
        description, long_description, team_name, team_members,
        tech_tags, submission_date
      ) VALUES (
        $1, $2, $3, 'AI Health Assistant',
        'An AI-powered health assistant that provides personalized wellness recommendations',
        'Our AI Health Assistant uses machine learning to analyze user health data and provide personalized wellness recommendations. The system learns from user feedback and adapts its suggestions over time to create a truly personalized health coaching experience.',
        'HealthTech Innovators',
        ARRAY['John Coder', 'Emma ML Engineer'],
        ARRAY['Python', 'TensorFlow', 'React Native', 'Flask'],
        '2025-06-22 09:45:00'
      ) RETURNING id
    `, [hackathon.id, hacker2.id, aiTrack.id]);

    // Create some sample reviews
    await db.none(`
      INSERT INTO reviews (
        project_id, hacker_id, comment, 
        innovation_rating, implementation_rating, impact_rating, presentation_rating
      ) VALUES (
        $1, $2, 
        'Really impressive project with great attention to detail. The UI is polished and the carbon calculation engine is robust.',
        4.5, 4.0, 4.5, 4.0
      )
    `, [project1.id, hacker2.id]);

    await db.none(`
      INSERT INTO reviews (
        project_id, hacker_id, comment, 
        innovation_rating, implementation_rating, impact_rating, presentation_rating
      ) VALUES (
        $1, $2, 
        'The ML model shows great promise, but could use more training data. Overall implementation is solid and the concept is innovative.',
        4.0, 3.5, 4.5, 4.0
      )
    `, [project2.id, hacker1.id]);

    // Create sample sponsors/allies
    const sponsor1 = await db.one(`
      INSERT INTO allies (
        name, mission_statement, logo_url, tier, description, website_url
      ) VALUES (
        'TechForward Inc.',
        'Empowering developers to build the future through open source and education.',
        'https://placehold.co/200x100?text=TechForward',
        'platinum',
        'A leading technology company focused on developer tools and cloud infrastructure.',
        'https://example.com/techforward'
      ) RETURNING id
    `);

    const sponsor2 = await db.one(`
      INSERT INTO allies (
        name, mission_statement, logo_url, tier, description, website_url
      ) VALUES (
        'GreenTech Solutions',
        'Creating a sustainable future through technology and innovation.',
        'https://placehold.co/200x100?text=GreenTech',
        'gold',
        'GreenTech provides sustainable technology solutions for businesses and consumers.',
        'https://example.com/greentech'
      ) RETURNING id
    `);

    // Link sponsors to hackathon
    await db.none(`
      INSERT INTO ally_hackathons (ally_id, hackathon_id)
      VALUES ($1, $2)
    `, [sponsor1.id, hackathon.id]);
    
    await db.none(`
      INSERT INTO ally_hackathons (ally_id, hackathon_id)
      VALUES ($1, $2)
    `, [sponsor2.id, hackathon.id]);

    console.log('Database seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

export default { seedDatabase };
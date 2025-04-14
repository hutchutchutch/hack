import HackathonModel from './models/hackathon';
import { Client } from 'pg';

async function seedTracks() {
  const client = new Client({
    user: 'hackistan',
    host: 'localhost',
    database: 'hackistan_db',
    password: 'hackistan',
    port: 5432,
  });

  try {
    console.log('Connecting to database to add sample data...');
    await client.connect();
    
    // Check if we already have tracks
    const checkTracks = await client.query('SELECT COUNT(*) as count FROM hackathon_tracks');
    if (parseInt(checkTracks.rows[0].count) > 0) {
      console.log('Tracks already exist, skipping track creation');
      
      // But we may still need to add projects and sponsors
      const checkProjects = await client.query('SELECT COUNT(*) as count FROM projects');
      if (parseInt(checkProjects.rows[0].count) === 0) {
        await addProjectsAndSponsors(client);
      } else {
        console.log('Projects already exist, skipping project creation');
      }
      
      return;
    }
    
    // Get the active hackathon id
    const hackathon = await client.query('SELECT id FROM hackathons WHERE status = \'active\' LIMIT 1');
    const hackathonId = hackathon.rows[0].id;
    
    // Add sample tracks
    console.log('Adding sample tracks...');
    await client.query(`
      INSERT INTO hackathon_tracks (hackathon_id, track_name, prizes)
      VALUES 
        ($1, 'Web Development', '1st Place: $3,000\n2nd Place: $1,500\n3rd Place: $500'),
        ($1, 'AI/ML', '1st Place: $3,000\n2nd Place: $1,500\n3rd Place: $500')
    `, [hackathonId]);

    await addProjectsAndSponsors(client);
    
    console.log('Sample data added successfully');
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await client.end();
  }
}

async function addProjectsAndSponsors(client: Client) {
  try {
    // Get the active hackathon id
    const hackathon = await client.query('SELECT id FROM hackathons WHERE status = \'active\' LIMIT 1');
    const hackathonId = hackathon.rows[0].id;
    
    // Add sample hackers
    console.log('Adding sample hackers...');
    await client.query(`
      INSERT INTO hackers (name, email, avatar_url, skills, status)
      VALUES
        ('Jane Developer', 'jane@example.com', 'https://randomuser.me/api/portraits/women/44.jpg', ARRAY['JavaScript', 'React', 'Node.js'], 'Member'),
        ('John Coder', 'john@example.com', 'https://randomuser.me/api/portraits/men/32.jpg', ARRAY['Python', 'TensorFlow', 'React'], 'Member')
      ON CONFLICT (email) DO NOTHING
    `);
    
    // Get hacker and track IDs
    const hackers = await client.query('SELECT id FROM hackers LIMIT 2');
    const tracks = await client.query('SELECT id FROM hackathon_tracks LIMIT 2');
    
    if (hackers.rows.length < 2 || tracks.rows.length < 2) {
      console.error('Not enough hackers or tracks found');
      return;
    }
    
    // Add sample projects
    console.log('Adding sample projects...');
    // First project - Web Development
    await client.query(`
      INSERT INTO projects (
        hackathon_id, hacker_id, track_id, project_name, 
        description, long_description, team_name, team_members,
        tech_tags, submission_date
      ) VALUES (
        $1, $2, $3, 'EcoTracker',
        'A web app to track your carbon footprint and suggest improvements',
        'EcoTracker is a comprehensive web application designed to help individuals and households track their carbon footprint across various aspects of daily life.',
        'Green Coders',
        ARRAY['Jane Developer', 'Sarah Designer'],
        ARRAY['React', 'Node.js', 'MongoDB', 'Chart.js'],
        '2025-06-20 14:30:00'
      )
    `, [hackathonId, hackers.rows[0].id, tracks.rows[0].id]);
    
    // Second project - AI/ML
    await client.query(`
      INSERT INTO projects (
        hackathon_id, hacker_id, track_id, project_name, 
        description, long_description, team_name, team_members,
        tech_tags, submission_date
      ) VALUES (
        $1, $2, $3, 'AI Health Assistant',
        'An AI-powered health assistant that provides personalized wellness recommendations',
        'Our AI Health Assistant uses machine learning to analyze user health data and provide personalized wellness recommendations.',
        'HealthTech Innovators',
        ARRAY['John Coder', 'Emma ML Engineer'],
        ARRAY['Python', 'TensorFlow', 'React Native', 'Flask'],
        '2025-06-22 09:45:00'
      )
    `, [hackathonId, hackers.rows[1].id, tracks.rows[1].id]);
    
    // Add allies (sponsors)
    console.log('Adding sample sponsors...');
    await client.query(`
      INSERT INTO allies (
        name, mission_statement, logo_url, tier, description, website_url
      ) VALUES
        (
          'TechForward Inc.',
          'Empowering developers to build the future through open source and education.',
          'https://placehold.co/200x100?text=TechForward',
          'platinum',
          'A leading technology company focused on developer tools and cloud infrastructure.',
          'https://example.com/techforward'
        ),
        (
          'GreenTech Solutions',
          'Creating a sustainable future through technology and innovation.',
          'https://placehold.co/200x100?text=GreenTech',
          'gold',
          'GreenTech provides sustainable technology solutions for businesses and consumers.',
          'https://example.com/greentech'
        )
      ON CONFLICT DO NOTHING
    `);
    
    // Link sponsors to hackathon
    const allies = await client.query('SELECT id FROM allies LIMIT 2');
    
    // Add first sponsor
    await client.query(`
      INSERT INTO ally_hackathons (ally_id, hackathon_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [allies.rows[0].id, hackathonId]);
    
    // Add second sponsor
    await client.query(`
      INSERT INTO ally_hackathons (ally_id, hackathon_id)
      VALUES ($1, $2)
      ON CONFLICT DO NOTHING
    `, [allies.rows[1].id, hackathonId]);
    
  } catch (error) {
    console.error('Error adding projects and sponsors:', error);
  }
}

async function testHackathonModel() {
  try {
    // First seed data if needed
    await seedTracks();
    
    console.log('\nTesting Hackathon Model...\n');
    
    // Test getActiveHackathon
    console.log('1. Getting active hackathon:');
    const hackathon = await HackathonModel.getActiveHackathon();
    console.log(JSON.stringify(hackathon, null, 2));
    
    if (!hackathon) {
      console.error('No active hackathon found');
      return;
    }
    
    // Test getTracksForHackathon
    console.log('\n2. Getting tracks for active hackathon:');
    const tracks = await HackathonModel.getTracksForHackathon(hackathon.id);
    console.log(JSON.stringify(tracks, null, 2));
    
    // Test getSubmissionsForHackathon
    console.log('\n3. Getting submissions for active hackathon:');
    const submissions = await HackathonModel.getSubmissionsForHackathon(hackathon.id);
    console.log(JSON.stringify(submissions, null, 2));
    
    // Test getSponsorsForHackathon
    console.log('\n4. Getting sponsors for active hackathon:');
    const sponsors = await HackathonModel.getSponsorsForHackathon(hackathon.id);
    console.log(JSON.stringify(sponsors, null, 2));
    
    console.log('\nAll model tests completed successfully!');
    
  } catch (error) {
    console.error('Error testing model:', error);
  }
}

testHackathonModel();
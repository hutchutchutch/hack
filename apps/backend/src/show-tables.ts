import PostgresConnection from './config/postgres';

const db = PostgresConnection.getInstance().getDB();

async function showTables() {
  try {
    // Get tables
    const tables = await db.any(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables in the database:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    if (tables.length === 0) {
      console.log('No tables found');
    }
    
    // Get sample data from the hackathons table
    const hackathons = await db.any('SELECT * FROM hackathons');
    
    console.log('\nSample hackathon data:');
    console.log(JSON.stringify(hackathons, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

showTables();
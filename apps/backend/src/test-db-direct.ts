import { Client } from 'pg';

async function testDbConnection() {
  const client = new Client({
    user: 'hackistan',
    host: 'localhost',
    database: 'hackistan_db',
    password: 'hackistan',
    port: 5432,
  });

  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    
    console.log('Connected successfully. Running test query...');
    const res = await client.query('SELECT * FROM hackathons');
    
    console.log('Query result:');
    console.log(res.rows);
    
    console.log('\nTesting table list...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('Tables in database:');
    tables.rows.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
  } catch (err) {
    console.error('Database connection error:', err);
  } finally {
    await client.end();
    console.log('Connection closed');
  }
}

testDbConnection();
import PostgresConnection from './config/postgres';

const db = PostgresConnection.getInstance().getDB();

async function testConnection() {
  try {
    // Test database connection
    const result = await db.one('SELECT 1 AS test');
    console.log('Database connection successful:', result);
    
    // Test getting tables
    const tables = await db.any(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('Tables in database:');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.table_name}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

testConnection();
import pgPromise from 'pg-promise';

// Initialize pg-promise with options
const pgp = pgPromise({});

class PostgresConnection {
  private static instance: PostgresConnection;
  private db: pgPromise.IDatabase<any>;

  private constructor() {
    const connectionString = process.env.DATABASE_URL || 
      'postgres://hackistan:hackistan@localhost:5432/hackistan_db';
    
    this.db = pgp(connectionString);
  }

  public static getInstance(): PostgresConnection {
    if (!PostgresConnection.instance) {
      PostgresConnection.instance = new PostgresConnection();
    }
    return PostgresConnection.instance;
  }

  public getDB(): pgPromise.IDatabase<any> {
    return this.db;
  }
}

export default PostgresConnection;
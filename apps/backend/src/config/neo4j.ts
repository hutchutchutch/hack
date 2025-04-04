import { Driver, Session, driver } from 'neo4j-driver';

class Neo4jConnection {
  private static instance: Neo4jConnection;
  private driver: Driver;

  private constructor() {
    const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
    const user = process.env.NEO4J_USER || 'neo4j';
    const password = process.env.NEO4J_PASSWORD || 'password';

    this.driver = driver(uri, {
      auth: {
        username: user,
        password: password,
      },
    });
  }

  public static getInstance(): Neo4jConnection {
    if (!Neo4jConnection.instance) {
      Neo4jConnection.instance = new Neo4jConnection();
    }
    return Neo4jConnection.instance;
  }

  public getSession(): Session {
    return this.driver.session();
  }

  public close(): void {
    this.driver.close();
  }
}

export default Neo4jConnection;

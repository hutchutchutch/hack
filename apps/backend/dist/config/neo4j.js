"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neo4j_driver_1 = require("neo4j-driver");
class Neo4jConnection {
    static instance;
    driver;
    constructor() {
        const uri = process.env.NEO4J_URI || 'neo4j://localhost:7687';
        const user = process.env.NEO4J_USER || 'neo4j';
        const password = process.env.NEO4J_PASSWORD || 'password';
        this.driver = (0, neo4j_driver_1.driver)(uri, {
            auth: {
                username: user,
                password: password,
            },
        });
    }
    static getInstance() {
        if (!Neo4jConnection.instance) {
            Neo4jConnection.instance = new Neo4jConnection();
        }
        return Neo4jConnection.instance;
    }
    getSession() {
        return this.driver.session();
    }
    close() {
        this.driver.close();
    }
}
exports.default = Neo4jConnection;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_promise_1 = require("pg-promise");
// Initialize pg-promise with options
const pgp = (0, pg_promise_1.default)({});
class PostgresConnection {
    static instance;
    db;
    constructor() {
        const connectionString = process.env.DATABASE_URL ||
            'postgres://hackistan:hackistan@localhost:5432/hackistan_db';
        this.db = pgp(connectionString);
    }
    static getInstance() {
        if (!PostgresConnection.instance) {
            PostgresConnection.instance = new PostgresConnection();
        }
        return PostgresConnection.instance;
    }
    getDB() {
        return this.db;
    }
}
exports.default = PostgresConnection;

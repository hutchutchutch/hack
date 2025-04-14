"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cors_1 = require("cors");
const dotenv_1 = require("dotenv");
const hackathon_routes_1 = require("./routes/hackathon.routes");
const db_init_1 = require("./config/db-init");
const seed_data_1 = require("./config/seed-data");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/hackathons', hackathon_routes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Service is healthy' });
});
// Initialize database and start server
async function startServer() {
    try {
        // Initialize database tables
        console.log('Initializing database...');
        await (0, db_init_1.initializeDatabase)();
        // Seed database with sample data
        console.log('Seeding database...');
        await (0, seed_data_1.seedDatabase)();
        // Start server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}
startServer();

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import hackathonRoutes from './routes/hackathon.routes';
import { initializeDatabase } from './config/db-init';
import { seedDatabase } from './config/seed-data';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000; // Changed to 4000 to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/hackathons', hackathonRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Service is healthy' });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database tables
    console.log('Initializing database...');
    await initializeDatabase();
    
    // Seed database with sample data
    console.log('Seeding database...');
    await seedDatabase();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { configRouter } from './routes/config.js';
import { chatRouter } from './routes/chat.js';
import { registerErrorHandlers } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/config', configRouter);
app.use('/api/chat', chatRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Register error handling middleware (must be after routes)
registerErrorHandlers(app);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
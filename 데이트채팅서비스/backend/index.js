const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const coupleRoutes = require('./routes/couple');
const placeRoutes = require('./routes/place');
const recommendRoutes = require('./routes/recommend');
const chatRoutes = require('./routes/chat');

const { setupSocketHandlers } = require('./services/socket');
const { updateDailyContent } = require('./services/dailyCuration');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/couple', coupleRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/recommend', recommendRoutes);
app.use('/api/chat', chatRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io Setup
setupSocketHandlers(io);

// Daily Curation Cron Job (매일 오전 6시 실행)
cron.schedule('0 6 * * *', async () => {
  console.log('Running daily curation update...');
  await updateDailyContent();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/navidate';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

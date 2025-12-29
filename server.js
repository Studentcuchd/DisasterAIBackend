const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { StatusCodes } = require('http-status-codes');
const dotenv = require('dotenv');

const connectDB = require('./config/db');
const predictionRoutes = require('./routes/predictionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const locationRoutes = require('./routes/locationRoutes');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration - normalize origins by removing trailing slashes
const allowedOrigins = (process.env.CLIENT_ORIGIN || '*').split(',').map(origin => origin.trim().replace(/\/$/, ''));

const io = require('socket.io')(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.emit('connected', { message: 'Connected to DisasterAI alerts stream' });
});

// Attach io to requests so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({ 
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(StatusCodes.OK).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/predictions', predictionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/locations', locationRoutes);

// Not found handler
app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error('❌ Unhandled error:', {
    message: err.message,
    status: err.status,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  const status = err.status || StatusCodes.INTERNAL_SERVER_ERROR;
  res.status(status).json({ 
    message: err.message || 'Something went wrong',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();

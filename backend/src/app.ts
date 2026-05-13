import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import passport from 'passport';

import { errorHandler } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { configurePassport } from './config/passport';
import { rejectForbiddenGeoOperators } from './middleware/mongoOperator.middleware';

// Routes
import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import voteRoutes from './routes/vote.routes';
import notificationRoutes from './routes/notification.routes';
import commentRoutes from './routes/comment.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';

const app: Application = express();

// Trust proxy for Render deployment
app.set('trust proxy', 1);

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Compression
app.use(compression());

// NoSQL Injection Prevention
app.use(rejectForbiddenGeoOperators);
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Passport Configuration
configurePassport();
app.use(passport.initialize());

// Rate Limiting
app.use('/api', generalLimiter);

// Static Files (Uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Voice2Action API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// 404 Handler
app.all('*', (req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;

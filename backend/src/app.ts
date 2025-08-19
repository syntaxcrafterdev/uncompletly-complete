import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import connectDB from './utils/db';
import authRoutes from './routes/auth.routes';
import eventRoutes from './routes/event.routes';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origin,
      credentials: true,
    }));

    // Request logging
    if (!config.isProduction) {
      this.app.use(morgan('dev'));
    }

    // Body parsers
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private initializeRoutes() {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // API routes
    this.app.use('/api/v1/auth', authRoutes);
    this.app.use('/api/v1/events', eventRoutes);

    // 404 handler
    this.app.use(notFoundHandler);
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public async start() {
    // Connect to database
    await connectDB();
    
    this.app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
      console.log(`Environment: ${config.env}`);
    });
  }
}

export default App;

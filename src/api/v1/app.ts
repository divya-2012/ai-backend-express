import express, { Express, NextFunction, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import swaggerUI from "swagger-ui-express";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import dotenv from "dotenv";
import winston from "winston";
import rateLimit from "express-rate-limit";

// Local imports
import api from "./router/index";
import errorMiddleware, { AppError } from "./middleware/errorHanding";

// Load environment variables
dotenv.config();

// Create logger for production
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info", // Default log level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Use JSON format for production logs
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // Add colors for better readability in the console
        winston.format.simple() // Simplified format for console output
      ),
    }),
    new winston.transports.File({
      filename: "error.log",
      level: "error", // Log only errors to this file
    }),
    new winston.transports.File({
      filename: "combined.log", // Log all levels to combined log file
    }),
  ],
});

// Create Express application
const createApp = async (): Promise<Express> => {
  const app: Express = express();

  // Security and performance middleware
  app.enable("trust proxy");
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
      }
    }
  }));
  app.use(compression());

  // Morgan middleware for logging HTTP requests with response time
  app.use(
    morgan(
      process.env.NODE_ENV === "production"
        ? ':method :url :status :response-time ms' // Simplified format for production
        : ':method :url :status :response-time ms - :res[content-length]', // More detailed for dev
      {
        stream: {
          write: (message) => logger.info(message.trim()), // Pass morgan logs to winston
        },
      }
    )
  );

  // Rate limiting middleware
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });
  app.use(limiter);

  // Parsing middleware
  app.use(express.json({
    limit: '1mb' // Limit payload size
  }));
  app.use(express.urlencoded({ extended: true }));

  // CORS configuration
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }));

  // Sentry initialization
  // Sentry.init({
  //   dsn: process.env.SENTRY_DSN,
  //   integrations: [
  //     new Sentry.Integrations.Http({ tracing: true }),
  //     new Sentry.Integrations.Express({ app }),
  //     new ProfilingIntegration(),
  //   ],
  //   tracesSampleRate: parseFloat(process.env.TRACES_SAMPLE_RATE || '0.1'),
  //   profilesSampleRate: parseFloat(process.env.PROFILES_SAMPLE_RATE || '0.1'),
  // });  

  // Sentry request handlers
  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());

  // Swagger documentation setup for Admin
  try {
    const YAML = await import('yamljs');
    const path = await import('path');
    const swaggerAdminDocs = YAML.load(
      path.resolve(__dirname, "../../config/swagger/swagger-admin.yaml")
    );
    app.use("/api-docs/admin", swaggerUI.serve, swaggerUI.setup(swaggerAdminDocs));
  } catch (error) {
    logger.error('Failed to load Swagger documentation for Admin', error);
  }

  // Swagger documentation setup for App
  try {
    const YAML = await import('yamljs');
    const path = await import('path');
    const swaggerWebDocs = YAML.load(
      path.resolve(__dirname, "../../config/swagger/swagger-app.yaml")
    );
    app.use("/api-docs/app", swaggerUI.serve, swaggerUI.setup(swaggerWebDocs));
  } catch (error) {
    logger.error('Failed to load Swagger documentation for Web', error);
  }

  // Basic health check route
  app.get("/", (_req: Request, res: Response) => {
    res.json({
      message: "Market On StreetMall API-V1 Working",
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.json({
      message: "Market On StreetMallAPI-V1 Working",
      status: "healthy",
      timestamp: new Date().toISOString()
    });
  });


  // API routes
  app.use("/v1", api);

  // Catch-all route for undefined routes
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Route ${req.originalUrl} not found`, 404));
  });

  // Error handling middleware
  app.use(errorMiddleware);

  // Sentry error handler
  app.use(Sentry.Handlers.errorHandler());

  // Unhandled rejection and exception handling
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Optionally exit the process
    // process.exit(1);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Optionally exit the process
    // process.exit(1);
  });

  return app;
};

export default createApp;
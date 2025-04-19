require('dotenv').config();
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as Sentry from "@sentry/node";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const formatErrorMessage = (message: string) => ({ error: message });

const sendErrorDev = (err: Error, res: Response, next: NextFunction) => {
  const statusCode = (err as AppError).statusCode || 500;

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((validationError) => {
      const fieldName = validationError.path.join('.');
      return `Invalid value for '${fieldName}': ${validationError.message}.`;
    }).join(' '); // Combine all Zod errors into a single message
    res.status(422).json({ success: false, message: formatErrorMessage(errorMessages), stack: err.stack });
  } else {
    res.status(statusCode).json({
      success: false,
      message: formatErrorMessage(err.message), // Wrap single message in { error: "message" } format
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err: Error, res: Response, next: NextFunction) => {
  const statusCode = (err as AppError).statusCode || 500;

  if (err instanceof ZodError) {
    const errorMessages = err.errors.map((validationError) => {
      const fieldName = validationError.path.join('.');
      return `Invalid value for '${fieldName}': ${validationError.message}.`;
    }).join(' ');
    res.status(422).json({ success: false, message: formatErrorMessage(errorMessages) });
  } else if ((err as AppError).isOperational) {
    res.status(statusCode).json({
      success: false,
      message: formatErrorMessage(err.message),
    });
  } else {
    res.status(statusCode).json({
      success: false,
      message: formatErrorMessage('Something went wrong. Please try again later.'),
    });
  }
};

const errorMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
  Sentry.captureException(err);

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res, next);
  } else {
    sendErrorProd(err, res, next);
  }
};

export default errorMiddleware;
import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";

export const notFound = (
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
  });
};

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const isOperational = err instanceof AppError;
  const statusCode = isOperational ? err.statusCode : 500;
  const message = isOperational ? err.message : "Internal Server Error";

  if (!isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
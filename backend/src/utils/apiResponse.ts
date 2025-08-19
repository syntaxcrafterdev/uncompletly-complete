import { Response } from 'express';

type ResponseData = {
  success: boolean;
  message?: string;
  data?: any;
  error?: any;
  [key: string]: any;
};

export const sendResponse = (
  res: Response,
  statusCode: number,
  data: ResponseData
) => {
  const response: ResponseData = {
    success: statusCode < 400,
    ...data,
  };

  return res.status(statusCode).json(response);
};

export const successResponse = (
  res: Response,
  data: any = null,
  message: string = 'Operation successful'
) => {
  return sendResponse(res, 200, {
    message,
    data,
  });
};

export const createdResponse = (
  res: Response,
  data: any = null,
  message: string = 'Resource created successfully'
) => {
  return sendResponse(res, 201, {
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number = 500,
  message: string = 'An error occurred',
  error: any = null
) => {
  return sendResponse(res, statusCode, {
    message,
    error: process.env.NODE_ENV === 'production' ? undefined : error?.message || error,
  });
};

export const notFoundResponse = (res: Response, message: string = 'Resource not found') => {
  return errorResponse(res, 404, message);
};

export const validationErrorResponse = (res: Response, errors: any) => {
  return sendResponse(res, 400, {
    message: 'Validation failed',
    errors,
  });
};

export const unauthorizedResponse = (res: Response, message: string = 'Unauthorized') => {
  return errorResponse(res, 401, message);
};

export const forbiddenResponse = (res: Response, message: string = 'Forbidden') => {
  return errorResponse(res, 403, message);
};

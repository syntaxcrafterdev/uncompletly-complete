import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';

export const notFoundHandler = (req: Request, _res: Response, next: Function) => {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
};

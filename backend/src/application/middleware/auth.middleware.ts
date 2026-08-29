import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../domain/common/errors/app-error";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

interface JwtPayload {
  sub: string;
  email: string;
}

export function createAuthMiddleware(jwtSecret: string) {
  return (
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): void => {
    try {
      const header = request.headers.authorization;

      if (!header?.startsWith("Bearer ")) {
        throw new UnauthorizedError("Token ausente");
      }

      const token = header.slice("Bearer ".length).trim();

      if (!token) {
        throw new UnauthorizedError("Token ausente");
      }

      const payload = jwt.verify(token, jwtSecret) as JwtPayload;

      if (!payload.sub) {
        throw new UnauthorizedError("Token inválido");
      }

      request.userId = payload.sub;
      request.userEmail = payload.email;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        next(error);
        return;
      }

      next(new UnauthorizedError("Token inválido"));
    }
  };
}

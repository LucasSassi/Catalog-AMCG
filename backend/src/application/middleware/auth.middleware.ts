import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  ForbiddenError,
  UnauthorizedError,
} from "../../domain/common/errors/app-error";
import type { RoleUsuario } from "../../domain/usuario/entity/usuario.constants";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userRole?: RoleUsuario;
}

interface JwtPayload {
  sub: string;
  email: string;
  role?: RoleUsuario;
}

function authenticateRequest(
  request: AuthenticatedRequest,
  jwtSecret: string,
): void {
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
  request.userRole = payload.role;
}

export function createAuthMiddleware(jwtSecret: string) {
  return (
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): void => {
    try {
      authenticateRequest(request, jwtSecret);
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

export function createRequireAdmin(jwtSecret: string) {
  return (
    request: AuthenticatedRequest,
    _response: Response,
    next: NextFunction,
  ): void => {
    try {
      authenticateRequest(request, jwtSecret);

      if (request.userRole !== "admin") {
        throw new ForbiddenError("Acesso restrito a administradores");
      }

      next();
    } catch (error) {
      if (
        error instanceof UnauthorizedError ||
        error instanceof ForbiddenError
      ) {
        next(error);
        return;
      }

      next(new UnauthorizedError("Token inválido"));
    }
  };
}

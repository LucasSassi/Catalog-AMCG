import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";

export interface RateLimitPreset {
  windowMs: number;
  limit: number;
}

export const RATE_LIMIT_MESSAGE =
  "Muitas requisições. Tente novamente mais tarde.";

export const LOGIN_RATE_LIMIT: RateLimitPreset = {
  windowMs: 15 * 60 * 1000,
  limit: 10,
};

export const CADASTRAR_RATE_LIMIT: RateLimitPreset = {
  windowMs: 60 * 60 * 1000,
  limit: 5,
};

export const CATALOG_RATE_LIMIT: RateLimitPreset = {
  windowMs: 60 * 1000,
  limit: 120,
};

export function createRateLimiter(
  preset: RateLimitPreset,
): RateLimitRequestHandler {
  return rateLimit({
    windowMs: preset.windowMs,
    limit: preset.limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_request, response) => {
      response.status(429).json({ error: RATE_LIMIT_MESSAGE });
    },
  });
}

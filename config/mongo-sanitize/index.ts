import { Request, Response, NextFunction } from "express";
import mongoSanitize from "express-mongo-sanitize";

export function sanitizeInputs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sanitizeOptions = {
    replaceWith: "_",
    onSanitize: ({ key, req }: { key: string; req: Request }) => {
      console.warn(`Sanitized key: ${key} in request: ${req.originalUrl}`);
    },
  };

  req.body = mongoSanitize.sanitize(req.body, sanitizeOptions);
  req.params = mongoSanitize.sanitize(req.params, sanitizeOptions);
  req.query = mongoSanitize.sanitize(req.query, sanitizeOptions);

  next();
}

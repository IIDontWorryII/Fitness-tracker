import { Request, Response, NextFunction } from "express";

/**
 * Blocks unauthenticated requests.
 * Attaches userId to request for downstream use.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req.session as any).userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  next();
}

import type { Request, Response, NextFunction } from "express";

export function requireSelf(req: Request, res: Response, next: NextFunction) {
  const auth = (req as any).user as { sub: string } | undefined;
  const { id } = req.params;
  if (!auth || !id || auth.sub !== id)
    return res.status(403).json({ message: "Forbidden" });
  next();
}

export function requireRole(role: "employer" | "jobseeker") {
  return (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).user as
      | { role?: "employer" | "jobseeker" }
      | undefined;
    if (!auth || auth.role !== role)
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}

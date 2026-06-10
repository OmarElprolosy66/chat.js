import { NextFunction, Request, Response } from "express";

/**
 * Authorization guard that ensures the user can only access their own resource.
 * It checks if the `id` in the URL parameters matches the authenticated user's ID.
 */
export const isOwnerGuard = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        // This should technically be caught by authenticateJWT first, but it's good practice.
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    if (req.params.id !== req.user.user_id) {
        return res.status(403).json({ message: "Forbidden: You are not authorized to access this resource." });
    }

    next();
};
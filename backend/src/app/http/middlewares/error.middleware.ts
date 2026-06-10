import { Request, Response, NextFunction } from 'express';

export const err = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err) {
        console.error(err);
        return res.status(500).json({ message: err.message || "Internal Server Error" });
    }
    next();
};
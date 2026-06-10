import { ZodType, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate = <T>(schema: ZodType<T>) => {
    return (req: Request, res: Response, next: NextFunction): Response | void => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error;
            return res.status(400).json({ message: "Validation error", errors: errors.issues });
        }

        req.body = result.data;
        next();
    };
};
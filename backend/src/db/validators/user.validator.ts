import { z } from 'zod';

export const CreateUserSchema = z.object({
    username: z.string().min(1).max(50).trim().nonempty(),
    email: z.email().max(200).trim().nonempty(),
    password: z.string().min(8).max(255).nonempty(),
});

export const UpdateUserSchema = z.object({
    username: z.string().min(1).max(50).trim().optional(),
    email: z.email().max(200).trim().optional(),
});

export const LoginScehma = z.object({
    email: z.email().max(200).trim().nonempty(),
    password: z.string().min(8).max(255).nonempty(),
});
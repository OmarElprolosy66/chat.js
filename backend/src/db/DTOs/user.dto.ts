import { z } from 'zod';
import {
    CreateUserSchema,
    UpdateUserSchema,
    LoginScehma
 } from '../validators/user.validator';

export type CreateUserDTO   = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO   = z.infer<typeof UpdateUserSchema>;
export type LoginDTO        = z.infer<typeof LoginScehma>;
export type UserResponseDTO = {
    id: string,
    username: string,
    email: string,
    createdAt: string, // ISO String
    updatedAt: string, // ISO Sring
};

export type AuthDTO = {
    id: string,
    username?: string,
    email: string,
    password?: string,
}
import { db } from "../../../db/db";
import { userSchema } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { IUserRepository } from "../../interfaces/repositories/IUserRepository";
import type {
    CreateUserDTO,
    UpdateUserDTO,
    UserResponseDTO,
    AuthDTO,
} from "../../../db/DTOs/user.dto";
import {
    toUserAuth,
    toUserResponse,
    type UserEntity,
} from '../../../db/mappers/user.mapper';

class UserRepository implements IUserRepository {
    async findById(id: string): Promise<UserResponseDTO | null> {
        try {
            const row = await db.select()
                .from(userSchema)
                .where(eq(userSchema.id, id));
            if (!row || row.length === 0) return null;
            return toUserResponse(row[0] as UserEntity);
        } catch (dbErr: any) {
            console.error('[UserRepository.findById] DB error:', {
                message: dbErr?.message,
                code: dbErr?.code,
                detail: dbErr?.detail,
                hint: dbErr?.hint,
            });
            throw dbErr;
        }
    }

    async findByEmail(email: string): Promise<AuthDTO | null> {
        const row = await db.select({
            id: userSchema.id,
            email: userSchema.email,
            password: userSchema.password
        }).from(userSchema)
          .where(eq(userSchema.email, email));
        if (!row || row.length === 0) return null;
        return toUserAuth(row[0] as UserEntity);
    }

    async create(userData: CreateUserDTO): Promise<AuthDTO> {
        const existing = await db
            .select({ id: userSchema.id })
            .from(userSchema)
            .where(eq(userSchema.email, userData.email))
            .limit(1);

        if (existing && existing.length > 0) {
            const err = new Error('Email already in use');
            (err as any).code = 'EMAIL_EXISTS';
            throw err;
        }

        try {
            const inserted = await db
                .insert(userSchema)
                .values({
                    username: userData.username,
                    email: userData.email,
                    password: userData.password, // already hashed by service
                })
                .returning();

            return toUserAuth(inserted[0] as UserEntity);
        } catch (dbErr: any) {
            // Log full error object and nested cause (postgres-js wraps errors)
            console.error('[UserRepository.createUser] DB error (insert):', dbErr);
            if (dbErr?.cause) {
                console.error('[UserRepository.createUser] DB error cause:', dbErr.cause);
                console.error('[UserRepository.createUser] DB error cause code/message:', dbErr.cause?.code, dbErr.cause?.message);
            }

            throw dbErr;
        }
    }

    async update(id: string, userData: UpdateUserDTO): Promise<UserResponseDTO | null> {
        const updateValues: Partial<UserEntity> = {};
        if (userData.username !== undefined) updateValues.username = userData.username;
        if (userData.email !== undefined) updateValues.email = userData.email;

        const updated = await db
            .update(userSchema)
            .set(updateValues)
            .where(eq(userSchema.id, id))
            .returning();

        if (!updated || updated.length === 0) return null;
        return toUserResponse(updated[0] as UserEntity);
    }

    async delete(id: string): Promise<void> {
        await db.delete(userSchema).where(eq(userSchema.id, id));
    }
}

export default UserRepository;
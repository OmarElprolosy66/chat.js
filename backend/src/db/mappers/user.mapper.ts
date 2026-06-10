import {
    CreateUserDTO,
    UpdateUserDTO,
    LoginDTO,
    UserResponseDTO,
    AuthDTO
} from '../DTOs/user.dto';
import { userSchema } from '../schema';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

export type UserEntity = InferSelectModel<typeof userSchema>;
export type NewUserDB  = InferInsertModel<typeof userSchema>;

/**
 * @description Maps a CreateUserDTO to a NewUserDB object.
 * @param {CreateUserDTO} dto - The CreateUserDTO to map.
 * @returns {NewUserDB} - The resulting NewUserDB object.
 */
export function toNewUserDB(dto: CreateUserDTO): NewUserDB {
    return {
        username: dto.username,
        email: dto.email,
        password: dto.password,
    }
}

/**
 * @description Converts a date to an ISO string.
 * @param {unknown} d - The date to convert.
 * @returns {string} - The ISO string representation of the date, or an empty string if the input is invalid.
 */
function toISO(d: unknown): string {
    if (!d) return '';
    if (d instanceof Date) return d.toISOString();
    return String(d);
}

/**
 * @description Maps a UserEntity to a UserResponseDTO.
 * @param {UserEntity} user - The UserEntity to map.
 * @returns {UserResponseDTO} - The resulting UserResponseDTO.
 */
export function toUserResponse(user: UserEntity): UserResponseDTO {
    return {
        id: String(user.id),
        username: user.username,
        email: user.email,
        createdAt: toISO(user.createdAt),
        updatedAt: toISO(user.updatedAt),
    };
}

export function toUserLogin(user: UserEntity): LoginDTO {
    return {
        email: user.email,
        password: user.password,
    };
}

export function toUserAuth(user: UserEntity): AuthDTO {
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        password: user.password
    }
}
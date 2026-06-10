import type {
    AuthDTO,
    CreateUserDTO,
    UpdateUserDTO,
    UserResponseDTO
} from '../../../db/DTOs/user.dto';

export interface IUserRepository {
    findById(id: string): Promise<UserResponseDTO | null>;
    findByEmail(email: string): Promise<AuthDTO | null>;
    create(userData: CreateUserDTO): Promise<AuthDTO>;
    update(id: string, userData: UpdateUserDTO): Promise<UserResponseDTO | null>;
    delete(id: string): Promise<void>;
}
import bcrypt from 'bcrypt';
import type { IUserRepository } from '../interfaces/repositories/IUserRepository';
import type {
    AuthDTO,
    CreateUserDTO,
    UpdateUserDTO,
    UserResponseDTO,
} from '../../db/DTOs';

export class UserService {
    constructor(private userRepo: IUserRepository) {}

    async createUser(dto: CreateUserDTO): Promise<AuthDTO> {
        const hashed  = await bcrypt.hash(dto.password, 10);
        const created = await this.userRepo.create({ ...dto, password: hashed });
        return created;
    }

    async getUserById(id: string): Promise<UserResponseDTO | null> {
        return this.userRepo.findById(id);
    }

    async getByEmail(email: string): Promise<AuthDTO | null> {
        return this.userRepo.findByEmail(email);
    }

    async updateUser(id: string, dto: UpdateUserDTO): Promise<UserResponseDTO | null> {
        // if (dto.password) {
        //     dto.password = await bcrypt.hash(dto.password, 10);
        // } // TODO: handel pasword chnge useing email !
        return this.userRepo.update(id, dto);
    }

    async deleteUser(id: string): Promise<void> {
        await this.userRepo.delete(id);
    }
}

export default UserService;
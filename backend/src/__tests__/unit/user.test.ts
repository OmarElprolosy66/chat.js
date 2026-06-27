import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../app/services/user.service';
import type { IUserRepository } from '../../app/interfaces/repositories/IUserRepository';
import type { CreateUserDTO, AuthDTO } from '../../db/DTOs';
import bcrypt from 'bcrypt';

// Mock the dependencies.
vi.mock('bcrypt');

// Create a mock UserRepository that we can control
const mockUserRepo: IUserRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
};

describe('UserService - Unit Tests', () => {
    let userService: UserService;

    // Before each test, create a new instance of the service with the mock repository
    beforeEach(() => {
        vi.clearAllMocks(); // Clear mocks between tests
        userService = new UserService(mockUserRepo);
    });

    it('should hash the password and create a user', async () => {
        // --- Arrange ---
        const userDto: CreateUserDTO = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
        };

        const hashedPassword = 'hashed_password';
        const createdUser: AuthDTO = { id: 'user-123', email: userDto.email };

        // Tell our mocks what to do when they are called
        vi.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
        vi.spyOn(mockUserRepo, 'create').mockResolvedValue(createdUser);

        // --- Act ---
        const result = await userService.createUser(userDto);

        // --- Assert ---
        expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
        expect(mockUserRepo.create).toHaveBeenCalledWith({ ...userDto, password: hashedPassword });
        expect(result).toEqual(createdUser);
    });

    it('should get a user by ID', async () => {
        const userId = 'user-123';
        const mockUser = { id: userId, username: 'testuser', email: 'test@example.com', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        vi.spyOn(mockUserRepo, 'findById').mockResolvedValue(mockUser);

        const result = await userService.getUserById(userId);

        expect(mockUserRepo.findById).toHaveBeenCalledWith(userId);
        expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found by ID', async () => {
        const userId = 'user-not-found';
        vi.spyOn(mockUserRepo, 'findById').mockResolvedValue(null);

        const result = await userService.getUserById(userId);

        expect(mockUserRepo.findById).toHaveBeenCalledWith(userId);
        expect(result).toBeNull();
    });

    it('should get a user by email', async () => {
        const email = 'test@example.com';
        const mockAuthUser: AuthDTO = { id: 'user-123', email, password: 'hashed_password' };
        vi.spyOn(mockUserRepo, 'findByEmail').mockResolvedValue(mockAuthUser);

        const result = await userService.getByEmail(email);

        expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(email);
        expect(result).toEqual(mockAuthUser);
    });

    it('should update user fields successfully', async () => {
        const userId = 'user-123';
        const updateDto = { username: 'updateduser' };
        const mockUpdatedUser = { id: userId, username: 'updateduser', email: 'test@example.com', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        vi.spyOn(mockUserRepo, 'update').mockResolvedValue(mockUpdatedUser);

        const result = await userService.updateUser(userId, updateDto);

        expect(mockUserRepo.update).toHaveBeenCalledWith(userId, updateDto);
        expect(result).toEqual(mockUpdatedUser);
    });

    it('should delete a user by ID', async () => {
        const userId = 'user-123';
        vi.spyOn(mockUserRepo, 'delete').mockResolvedValue(undefined);

        await userService.deleteUser(userId);

        expect(mockUserRepo.delete).toHaveBeenCalledWith(userId);
    });
});
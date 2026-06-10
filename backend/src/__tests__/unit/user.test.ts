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
        // Check that bcrypt.hash was called with the correct password
        expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
        // Check that the repository's create method was called with the hashed password
        expect(mockUserRepo.create).toHaveBeenCalledWith({ ...userDto, password: hashedPassword });
        // Check that the service returned the user from the repository
        expect(result).toEqual(createdUser);
    });
});
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../bootstrap/app';
import { db } from '../../db/db';
import { userSchema } from '../../db/schema';

// We run these tests against a real database, so we need to clean up.
describe('AuthController - Integration Tests', () => {

    // Before all tests, clear the users table to ensure a clean state
    beforeAll(async () => {
        await db.delete(userSchema);
    });

    // After all tests, you might want to clean up again
    afterAll(async () => {
        await db.delete(userSchema);
    });

    describe('POST /api/v1/auth/register', () => {
        it('should register a new user successfully and return a token', async () => {
            const newUser = {
                username: 'integration_test_user',
                email: 'integration@test.com',
                password: 'a_strong_password_123',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(newUser);

            // Assert HTTP response
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(newUser.email);
            expect(response.body.user).not.toHaveProperty('password'); // IMPORTANT: Never return the password
        });

        it('should fail to register a user with an email that already exists', async () => {
            const existingUser = {
                username: 'another_user',
                email: 'integration@test.com', // Same email as the test above
                password: 'another_password_456',
            };

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(existingUser);

            // Assert HTTP response
            expect(response.status).toBe(500); // Your repo throws a generic error, which error.middleware turns into a 500
            expect(response.body.message).toContain('Email already in use');
        });
    });

    describe('POST /api/v1/auth/login', () => {
        const testUser = {
            username: 'login_test_user',
            email: 'login@test.com',
            password: 'password123_strong',
        };

        // Create the user before testing login
        beforeAll(async () => {
            await request(app)
                .post('/api/v1/auth/register')
                .send(testUser);
        });

        it('should log in successfully with correct credentials', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password,
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('user');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user.email).toBe(testUser.email);
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should fail to log in with an incorrect password', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrong_password',
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Invalid credentials');
        });

        it('should fail to log in with a non-existent email', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'doesnotexist@test.com',
                    password: testUser.password,
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toContain('User not found');
        });
    });
});
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../../bootstrap/app';
import { db } from '../../db/db';
import { userSchema } from '../../db/schema';

describe('UserController - Integration Tests', () => {
    let user1: any;
    let token1: string;
    let user2: any;
    let token2: string;

    beforeAll(async () => {
        // Clean up database
        await db.delete(userSchema);

        // Register two users for testing cross-user authorization (ownership guard)
        const res1 = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'user_one',
                email: 'user1@test.com',
                password: 'password123',
            });
        user1 = res1.body.user;
        token1 = res1.body.token;

        const res2 = await request(app)
            .post('/api/v1/auth/register')
            .send({
                username: 'user_two',
                email: 'user2@test.com',
                password: 'password123',
            });
        user2 = res2.body.user;
        token2 = res2.body.token;
    });

    afterAll(async () => {
        await db.delete(userSchema);
    });

    describe('GET /api/v1/users/:id', () => {
        it('should successfully get own user details', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user1.id}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(user1.id);
            expect(response.body.username).toBe(user1.username);
            expect(response.body.email).toBe(user1.email);
            expect(response.body).not.toHaveProperty('password');
        });

        it('should fail to get details of another user (forbidden)', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user2.id}`)
                .set('Authorization', `Bearer ${token1}`); // Authenticated as User 1, accessing User 2

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Forbidden');
        });

        it('should fail to get user details without authorization header (unauthorized)', async () => {
            const response = await request(app)
                .get(`/api/v1/users/${user1.id}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Unauthorized');
        });
    });

    describe('POST /api/v1/users/:id', () => {
        it('should successfully update own user details', async () => {
            const response = await request(app)
                .post(`/api/v1/users/${user1.id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    username: 'updated_user_one',
                });

            expect(response.status).toBe(200);
            expect(response.body.id).toBe(user1.id);
            expect(response.body.username).toBe('updated_user_one');
        });

        it('should fail to update with validation errors (invalid email)', async () => {
            const response = await request(app)
                .post(`/api/v1/users/${user1.id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    email: 'invalid-email-format',
                });

            expect(response.status).toBe(400);
        });

        it('should fail to update another user (forbidden)', async () => {
            const response = await request(app)
                .post(`/api/v1/users/${user2.id}`)
                .set('Authorization', `Bearer ${token1}`)
                .send({
                    username: 'hack_attempt',
                });

            expect(response.status).toBe(403);
            expect(response.body.message).toContain('Forbidden');
        });
    });

    describe('DELETE /api/v1/users/:id', () => {
        it('should fail to delete another user (forbidden)', async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${user2.id}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(response.status).toBe(403);
        });

        it('should successfully delete own user profile', async () => {
            const response = await request(app)
                .delete(`/api/v1/users/${user1.id}`)
                .set('Authorization', `Bearer ${token1}`);

            expect(response.status).toBe(204);

            // Verify user is deleted by attempting to log in or query them (should not exist)
            const getRes = await request(app)
                .get(`/api/v1/users/${user1.id}`)
                .set('Authorization', `Bearer ${token1}`);
            
            // Should be 404 not found because the user was deleted from the DB
            expect(getRes.status).toBe(404);
        });
    });
});

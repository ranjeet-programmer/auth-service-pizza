import request from 'supertest';
import app from '../../src/app';
describe('POST /auth/register', () => {
    describe('Given all fields', () => {
        it('should return 201 status code', async () => {
            /// AAA - Arrange, Act, Assert

            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(201);
        });

        it('should return valid JSON response', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.headers['content-type']).toEqual(
                expect.stringContaining('json'),
            );
        });

        it('should persist the user in the database', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };

            await request(app).post('/auth/register').send(userData);
        });
    });

    describe('Fields are missing', () => {});
});

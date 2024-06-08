import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { truncateTables } from '../utils';
describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // database truncate;
        await truncateTables(connection);
    });

    afterAll(async () => {
        await connection.destroy();
    });

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

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(1);
            expect(users[0].firstName).toBe(userData.firstName);
            expect(users[0].lastName).toBe(userData.lastName);
            expect(users[0].email).toBe(userData.email);
        });
    });

    describe('Fields are missing', () => {});
});

import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';

describe('POST /auth/register', () => {
    let connection: DataSource;

    beforeAll(async () => {
        connection = await AppDataSource.initialize();
    });

    beforeEach(async () => {
        // database truncate;
        await connection.dropDatabase();
        await connection.synchronize();
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

        it('should return an id of the creater user', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const regex = /"id":/;

            expect(response.text).toMatch(regex);
        });

        it('should assign a customer role', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0]).toHaveProperty('role');
            expect(users[0].role).toBe(Roles.customer);
        });

        it('should store the hashed password in the database', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };

            await request(app).post('/auth/register').send(userData);

            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].password).not.toBe(userData.password);
            expect(users[0].password).toHaveLength(60);
            expect(users[0].password).toMatch(/^\$2b\$\d+\$/);
        });

        it('should return 400 statusc code if email is already exists', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
                role: Roles.customer,
            };

            const userRepository = connection.getRepository(User);
            await userRepository.save(userData);

            const response = await request(app)
                .post('/auth/register')
                .send(userData);
            const users = await userRepository.find();
            expect(response.statusCode).toBe(400);
            expect(users).toHaveLength(1);
        });
    });

    describe('Fields are missing', () => {
        it('should return 400 status code if email field is missing', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: '',
                password: 'pass@123',
                role: Roles.customer,
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            expect(response.statusCode).toBe(400);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users).toHaveLength(0);
        });
    });

    describe('Fields are not in proper format', () => {
        it('should trim the email field', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: '     ranjeethingeofficial@gmail.com    ',
                password: 'pass@123',
                role: 'customer',
            };

            await request(app).post('/auth/register').send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users[0].email).toBe('ranjeethingeofficial@gmail.com');
        });
    });
});

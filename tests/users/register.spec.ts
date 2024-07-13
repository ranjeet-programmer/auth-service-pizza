import request from 'supertest';
import app from '../../src/app';
import { User } from '../../src/entity/User';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/data-source';
import { Roles } from '../../src/constants';
import { isJWT } from '../utils';
import { RefreshToken } from '../../src/entity/RefreshToken';

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

        it('should return the refresh_token and access_token inside cookie', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };

            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            interface Headers {
                ['set-cookie']: string[];
            }
            // Assert
            let accessToken = null;
            let refreshToken = null;

            const cookies =
                (response.headers as unknown as Headers)['set-cookie'] || [];

            cookies.forEach((cookie) => {
                if (cookie.startsWith('accessToken=')) {
                    accessToken = cookie.split(';')[0].split('=')[1];
                }
                if (cookie.startsWith('refreshToken=')) {
                    refreshToken = cookie.split(';')[0].split('=')[1];
                }
            });

            expect(accessToken).not.toBeNull();
            expect(refreshToken).not.toBeNull();

            expect(isJWT(accessToken)).toBeTruthy();
            expect(isJWT(refreshToken)).toBeTruthy();
        });

        it('should store the refresh token in the database', async () => {
            // Arrange
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };

            // Assert
            const response = await request(app)
                .post('/auth/register')
                .send(userData);

            // Act
            const refreshTokenRepo = connection.getRepository(RefreshToken);

            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .where('refreshToken.userId = :userId', {
                    userId: response.body.id,
                })
                .getMany();
            expect(tokens).toHaveLength(1);
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

        it('should return 400 status if firstName is missing', async () => {
            const userData = {
                firstName: '',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
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

        it('should return 400 status if lastName is missing', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: '',
                email: 'ranjeethingeofficial@gmail.com',
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

        it('should return 400 status if password is missing', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: '',
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

        it('should return 400 status code if email is not a valid email', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: '@xyz.com',
                password: 'pass@123',
                role: 'customer',
            };

            await request(app).post('/auth/register').send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users.length).toBe(0);
        });

        it('should return 400 status code if password is less than 8 characters', async () => {
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass',
                role: 'customer',
            };

            await request(app).post('/auth/register').send(userData);
            const userRepository = connection.getRepository(User);
            const users = await userRepository.find();
            expect(users.length).toBe(0);
        });
    });
});

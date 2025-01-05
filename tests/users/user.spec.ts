import { JWKSMock } from './../../node_modules/mock-jwks/build/index.d';
import request from 'supertest';
import app from '../../src/app';
import createJWKSMock from 'mock-jwks'
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";
import { User } from '../../src/entity/User';
import { Roles } from '../../src/constants';


describe('GET /auth/self', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>;

    beforeAll( async () => {
        jwks = createJWKSMock('http://localhost:5501');
        connection = await AppDataSource.initialize();
    })

    beforeEach( async () => {
        jwks.start();
        await connection.dropDatabase();
        await connection.synchronize();
    })

    afterEach( () => {
        jwks.stop();
    })

    afterAll( async () =>  {
        await connection.destroy();
    })

    describe('Given all fields', () => {
        it('should return the 200 status code', async () => {
            const accessToken = jwks.token({
                sub: '1',
                role: Roles.customer,
            })
            const response = await request(app).get('/auth/self').set('Cookie',[`accessToken=${accessToken}`]).send();
            expect(response.statusCode).toBe(200);
        })
        it('should return the user data', async () => {
            // register a user
            const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({...userData, role: Roles.customer})
            // generate token
            const accessToken = jwks.token({
                sub:String(data.id),
                role: data.role,
            })
            // add token to key
            const response = await request(app).get('/auth/self').set('Cookie',[`accessToken=${accessToken}`]).send();
            // assert : check if user id matches with registered user
            expect((response.body as Record<string,string>).id).toBe(data.id);
        })
        it('should not return the password field', async () => {
             // register a user
             const userData = {
                firstName: 'Ranjeet',
                lastName: 'Hinge',
                email: 'ranjeethingeofficial@gmail.com',
                password: 'pass@123',
            };
            const userRepository = connection.getRepository(User);
            const data = await userRepository.save({...userData, role: Roles.customer})
            // generate token
            const accessToken = jwks.token({
                sub:String(data.id),
                role: data.role,
            })
            // add token to key
            const response = await request(app).get('/auth/self').set('Cookie',[`accessToken=${accessToken}`]).send();
            // assert : check if user id matches with registered user
            expect((response.body as Record<string,string>)).not.toHaveProperty("password");
        })
    })
});
import request from 'supertest';
import app from '../../src/app';
import { DataSource } from "typeorm";
import { AppDataSource } from "../../src/config/data-source";


describe('POST /auth/login', () => {
    let connection: DataSource
    beforeAll( async () => {
        connection = await AppDataSource.initialize();
    })

    beforeEach( async () => {
        await connection.dropDatabase();
        await connection.synchronize();
    })

    afterAll( async () =>  {
        await connection.destroy();
    })

    describe('Given all fields', () => {

        it('should login user', async () => {
            const loginData = {
                email : 'ranjeet1@gmail.com',
                password: 'XXXXXXXX'
            }
            const res = await request(app).post('/auth/login').send(loginData);
            expect(res.statusCode).toBe(200);

        });
    })
});
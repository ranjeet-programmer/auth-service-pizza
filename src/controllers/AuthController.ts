/* eslint-disable no-unused-vars */
import fs from 'fs';
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload, SignOptions, sign } from 'jsonwebtoken';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config/index';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}
interface RegisterUserRequest extends Request {
    body: UserData;
}
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
    ) {}

    async register(
        req: RegisterUserRequest,
        res: Response,
        next: NextFunction,
    ) {
        // validation using express-validator
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return res.status(400).json({
                errors: result.array(),
            });
        }
        const { firstName, lastName, email, password } = req.body;

        this.logger.debug('New request to register a user', {
            firstName,
            lastName,
            email,
        });

        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
            });

            this.logger.info('user has been registered', {
                id: user.id,
            });

            let privatekey: Buffer;

            try {
                privatekey = fs.readFileSync(
                    path.join(__dirname, '../../certs/private.pem'),
                );
            } catch (err) {
                const error = createHttpError(
                    500,
                    'Error while reading private key',
                );
                next(error);
                return;
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };
            const options: SignOptions = {
                algorithm: 'RS256',
                expiresIn: '1h',
                issuer: 'auth-service',
            };

            const accessToken = sign(payload, privatekey, options);

            // store the refresh token to db

            const MS_IN_YEARS = 1000 * 60 * 60 * 24 * 365;
            const refreshTokenRepoistory =
                AppDataSource.getRepository(RefreshToken);
            const newRefreshToken = await refreshTokenRepoistory.save({
                user: user,
                expiresAt: new Date(Date.now() + MS_IN_YEARS),
            });

            const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
                algorithm: 'HS256',
                expiresIn: '1y',
                issuer: 'auth-service',
                jwtid: String(newRefreshToken.id),
            });

            res.cookie('accessToken', accessToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60, // 1hr
                httpOnly: true,
            });

            res.cookie('refreshToken', refreshToken, {
                domain: 'localhost',
                sameSite: 'strict',
                maxAge: 1000 * 60 * 60 * 24 * 365, // 1year
                httpOnly: true,
                secure: true,
            });

            res.status(201).json({
                id: user.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }
}

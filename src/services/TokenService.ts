import { JwtPayload, sign } from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import createHttpError from 'http-errors';
import { Config } from '../config';
import { User } from '../entity/User';
import { RefreshToken } from '../entity/RefreshToken';
import { Repository } from 'typeorm';
export class TokenService {
    // eslint-disable-next-line no-unused-vars
    constructor(private refreshTokenRepository: Repository<RefreshToken>) {}

    generateAccessToken(payload: JwtPayload) {
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

            throw error;
        }

        const accessToken = sign(payload, privatekey, {
            algorithm: 'RS256',
            expiresIn: '1h',
            issuer: 'auth-service',
        });
        return accessToken;
    }

    generateRefreshToken(payload: JwtPayload) {
        const refreshToken = sign(payload, Config.REFRESH_TOKEN_SECRET!, {
            algorithm: 'HS256',
            expiresIn: '1y',
            issuer: 'auth-service',
            jwtid: String(payload.id),
        });

        return refreshToken;
    }

    async persistRefreshToken(user: User) {
        const MS_IN_YEARS = 1000 * 60 * 60 * 24 * 365;
        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEARS),
        });
        return newRefreshToken;
    }
}

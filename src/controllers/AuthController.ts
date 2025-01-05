
/* eslint-disable no-unused-vars */
import { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Logger } from 'winston';
import { validationResult } from 'express-validator';
import { JwtPayload } from 'jsonwebtoken';
import { AppDataSource } from '../config/data-source';
import { RefreshToken } from '../entity/RefreshToken';
import { TokenService } from '../services/TokenService';
import createHttpError from 'http-errors';
import { CredentialService } from '../services/CredentialService';
import { AuthRequest } from '../types';

interface UserData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}
interface RegisterUserRequest extends Request {
    body: UserData;
}

interface loginUserRequest extends Request {
    body: LoginData;
}
export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger,
        private tokenService: TokenService,
        private credentialService: CredentialService
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

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);

            // store the refresh token to db
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
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
            });

            res.status(201).json({
                id: user.id,
            });
        } catch (error) {
            next(error);
            return;
        }
    }

    async login(req:loginUserRequest,res:Response,next:NextFunction) {
        const result = validationResult(req);
        if(!result.isEmpty()){
            return res.status(400).json({
                errors:result.array()
            })
        }
        const { email, password } = req.body;

        this.logger.debug('New request to login a user', {
            email,
            password: '****'
        });

        
        try {
            // check if email exists in db or not
            const user = await this.userService.findByEmail(email);
            if(!user) {
                const error = createHttpError(400,"Email or Password does not match.");
                next(error);
                return;
            }
            // if user exists compare the password
            const isPasswordValid = await this.credentialService.comparePassword(password, user.password);
            if(!isPasswordValid) {
                const error = createHttpError(400, "Email or Password does not match.");
                next(error);
                return;
            }
            // if password match generate the token;
            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            };

            const accessToken = this.tokenService.generateAccessToken(payload);
            
            //persist the refresh token
            const newRefreshToken = await this.tokenService.persistRefreshToken(user);
            const refreshToken = this.tokenService.generateRefreshToken({
                ...payload,
                id: String(newRefreshToken.id),
            });

            res.cookie("accessToken",accessToken,{
                domain:"localhost",
                sameSite:"strict",
                maxAge:1000*60*60, // 1hr
                httpOnly:true
            })

            res.cookie("refreshToken",refreshToken,{
                domain:"localhost",
                sameSite:"strict",
                maxAge:1000*60*60*24*365, // 1hr
                httpOnly:true
            })

            this.logger.info("User has been logged in",{id:user.id})
            return res.status(200).json({
                id:user.id
            })

        } catch (error) {
            next(error);
            return;
        }
    }

    async self(req:AuthRequest,res:Response) {
        const user = await this.userService.findById(Number(req.auth.sub));
        return res.json({...user,password:undefined});
    }
}

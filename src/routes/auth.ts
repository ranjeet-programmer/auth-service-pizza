import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import registerValidators from '../validators/register-validators';
import loginValidators from '../validators/login-validators';
import { TokenService } from '../services/TokenService';
import { RefreshToken } from '../entity/RefreshToken';
import { CredentialService } from '../services/CredentialService';
const userRepository = AppDataSource.getRepository(User);
const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);
const userService = new UserService(userRepository);
const tokenService = new TokenService(refreshTokenRepository);
const credentialService = new CredentialService();
const authController = new AuthController(userService, logger, tokenService,credentialService);

const router = express.Router();

router.post(
    '/register',
    registerValidators,
    (req: Request, res: Response, next: NextFunction) => {
        authController.register(req, res, next);
    },
);

router.post('/login', loginValidators, (req: Request,res:Response, next:NextFunction) => {
    authController.login(req, res,next);
});

export default router;

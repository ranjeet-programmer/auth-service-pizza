import express, { NextFunction, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserService } from '../services/UserService';
import { User } from '../entity/User';
import { AppDataSource } from '../config/data-source';
import logger from '../config/logger';
import registerValidators from '../validators/register-validators';
const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);
const authController = new AuthController(userService, logger);

const router = express.Router();

router.post(
    '/register',
    registerValidators,
    (req: Request, res: Response, next: NextFunction) => {
        authController.register(req, res, next);
    },
);

export default router;

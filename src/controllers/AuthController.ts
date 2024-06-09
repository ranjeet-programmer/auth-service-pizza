import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entity/User';

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
    async register(req: RegisterUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body;

        const userRepository = AppDataSource.getRepository(User);

        const user = await userRepository.save({
            firstName,
            lastName,
            email,
            password,
        });
        console.log('user', user);

        res.status(201).json({
            id: user.id,
        });
    }
}

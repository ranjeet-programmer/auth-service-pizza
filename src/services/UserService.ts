import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserData } from '../types';
import { User } from '../entity/User';
import createHttpError from 'http-errors';
import { Roles } from '../constants';

export class UserService {
    // eslint-disable-next-line no-unused-vars
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        // hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const isUserAlreadyExists = await this.userRepository.findOne({
            where: { email: email },
        });

        if (isUserAlreadyExists) {
            const error = createHttpError(400, 'Email is already exists');
            throw error;
        }

        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Roles.customer,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw error;
        }
    }

    async findByEmail(email:string) {
        return await this.userRepository.findOne({where:{email:email}})
    }

    async findById(id: number) {
        return await this.userRepository.findOne({where:{id:id}})
    }
}

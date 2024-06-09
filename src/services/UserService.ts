import { Repository } from 'typeorm';
import { UserData } from '../types';
import { User } from '../entity/User';
import createHttpError from 'http-errors';

export class UserService {
    // eslint-disable-next-line no-unused-vars
    constructor(private userRepository: Repository<User>) {}

    async create({ firstName, lastName, email, password }: UserData) {
        try {
            return await this.userRepository.save({
                firstName,
                lastName,
                email,
                password: password,
            });
        } catch (err) {
            const error = createHttpError(
                500,
                'Failed to store the data in the database',
            );
            throw error;
        }
    }
}

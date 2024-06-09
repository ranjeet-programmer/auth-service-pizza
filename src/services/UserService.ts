import { Repository } from 'typeorm';
import { UserData } from '../types';
import { User } from '../entity/User';
import createHttpError from 'http-errors';
import { Roles } from '../constants';

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
}

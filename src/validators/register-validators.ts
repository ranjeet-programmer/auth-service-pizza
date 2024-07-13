import { checkSchema } from 'express-validator';

// export default [body('email').notEmpty().withMessage('Email is required')]

export default checkSchema({
    email: {
        errorMessage: 'Email is required',
        notEmpty: true,
        trim: true,
        isEmail: true,
    },
    firstName: {
        errorMessage: 'firstName is required',
        notEmpty: true,
        trim: true,
    },
    lastName: {
        errorMessage: 'lastName is required',
        notEmpty: true,
        trim: true,
    },
    password: {
        errorMessage: 'password is required',
        notEmpty: true,
        trim: true,
        isLength: {
            options: {
                min: 8,
            },
        },
    },
});

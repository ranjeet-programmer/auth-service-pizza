import express, { NextFunction, Request, Response } from 'express';
import logger from './config/logger';
import cookieParser from 'cookie-parser';
import { HttpError } from 'http-errors';
import authRouter from './routes/auth';
import 'reflect-metadata';

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

app.get('/', async (req: any, res: any) => {
    res.send('welcome to auth service');
});

app.use('/auth', authRouter);

// eslint-disable-next-line no-unused-vars
app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message);
    const statusCode = err.statusCode || err.status || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                message: err.message,
                path: '',
                location: '',
            },
        ],
    });
});

export default app;

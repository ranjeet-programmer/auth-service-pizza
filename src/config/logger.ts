import winston from 'winston';
import { Config } from '.';

const logger = winston.createLogger({
    level: 'debug',
    defaultMeta: {
        serviceName: 'auth-service',
    },
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
                winston.format.colorize(),
            ),
            silent: Config.NODE_ENV === 'test',
        }),
    ],
});

export default logger;

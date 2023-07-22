import { NextFunction, Request, Response } from 'express';
import User from './models/user';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, json } = format;



import ErrorResponse from './interfaces/ErrorResponse';

export function notFound(req: Request, res: Response, next: NextFunction) {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
}

export async function validateUser(req: Request, res: Response, next: NextFunction) {
    if(req.user){
        return next();
    }
    if(req.headers['x-api-key']) {
        //@ts-ignore
        req.user = await User.findOne({apiKey: req.headers['x-api-key']});
        //@ts-ignore
        req.session.passport = {user: String(req.user._id)}
        req.logger.info({typeOfLogin: 'apiKey'});
        return req.session.save(err => {
            next(err);
        })
    }
    return res.redirect('/login/google')
}

export function addLogger(req: Request, res: Response, next: NextFunction) {
    const logger = createLogger({
        format: combine(
            label({ label: req.user?.email || 'No User' }),
            timestamp(),
            json()
        ),
        transports: [new transports.Console()]
    });
    req.logger = logger;
    return next()
}
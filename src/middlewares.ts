//@ts-nocheck
import { NextFunction, Request, Response } from 'express';
import User from './models/user';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, json } = format;
import jwt from 'jsonwebtoken';


import ErrorResponse from './interfaces/ErrorResponse';

export function notFound(req: Request, res: Response, next: NextFunction) {
    res.status(404);
    const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
    next(error);
}

export function errorHandler(err: Error, req: Request, res: Response<ErrorResponse>, next: NextFunction) {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    req.logger.error({
        message: err.message,
        stack: err.stack,
    })
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
    next();
}

export async function validateUser(req: Request, res: Response, next: NextFunction) {
    if(req.isAuthenticated()){
        return next();
    }
    if(req.headers['x-api-key']) {
        req.user = await User.findOne({apiKey: req.headers['x-api-key']});
        req.session.passport = {user: String(req.user._id)}
        req.logger.info({typeOfLogin: 'apiKey'});
        return req.session.save(err => {
            next(err);
        })
    }
    return res.status(401).json({error: 'Unauthenticated'})
}

export async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token || token === 'null') {
        return res.status(401).send('Not Authenticated');
    }
    try {
        let user = await jwt.verify(token, process.env.EXPRESS_SESSION_SECRET || 'shhh');
        user = await User.findById(user.id);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).send('Invalid auth')
    }
};

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
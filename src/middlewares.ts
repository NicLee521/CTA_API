//@ts-nocheck
import { NextFunction, Request, Response } from 'express';
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, json } = format;
import { createClient } from "@openauthjs/openauth/client"
import { object, string } from "valibot"
import { createSubjects } from "@openauthjs/openauth/subject"
import ErrorResponse from './interfaces/ErrorResponse';
import 'dotenv/config';
const subjects = createSubjects({
    user: object({
        id: string(),
        email: string(),
    }),
})

const client = createClient({
    clientId: process.env.OPENAUTH_CLIENT_ID,
    issuer: process.env.OPENAUTH_ISSUER,
});

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

export async function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token || token === 'null') {
        return res.status(401).send('Not Authenticated');
    }
    try {
        const verified = await client.verify(subjects, token);
        if (verified.err) {
            throw new Error('Invalid token');
        }
        req.user = verified.subject;
        next();
    } catch (err) {
        console.log(err);
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
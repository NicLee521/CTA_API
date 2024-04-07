import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import passport from './lib/passport';
import * as middlewares from './middlewares';
import routes from './routes';


require('./config');
require('express-async-errors');
const app = express();
app.set('trust proxy', 2)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(middlewares.addLogger);
app.get('/login/google', passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
}));

app.get("/login/failed", (req,res) => {
    res.status(401).json({
        success:false,
        message: "failure",
    });
});

app.get('/oauth2/redirect/google',
    passport.authenticate('google', { 
        failureRedirect: '/login/failed', 
        failureMessage: true,
        session: false,
    }),
    (req, res) => {
        const user = {
            id: String(req.user._id),
            name: req.user.email,
        }
        const token = jwt.sign(user, process.env.EXPRESS_SESSION_SECRET || 'shhh', {expiresIn: '2h'});
        const FRONTEND_URL = process.env.FRONTEND_URL || 'localhost:3000';
        res.redirect(FRONTEND_URL + `/?token=${token}`)
    }
);

app.get("/user", middlewares.authenticateToken, (req: any, res) => {
    if(req.user) {
        return res.status(200).json(req.user);
    }
})

app.get("/logout", middlewares.authenticateToken, (req, res) => {
    if (req.user) {
        req.logger.info('Logged out')
        return res.status(200).send('done');
    }
    res.send('logged out')
})

app.get("/health", (req, res) => {
    res.status(200).send('healthy')
})

app.use(routes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import MongoStore from 'connect-mongo';
import passport from './lib/passport';
import * as middlewares from './middlewares';
import routes from './routes';


require('./config');
require('express-async-errors');
console.log(process.env.DOMAIN);
const app = express();
app.set('trust proxy', true)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET || '',
    resave: false,
    saveUninitialized: true,
    proxy: true,
    name: 'AuthCookies',
    cookie: { 
        maxAge:  1000 * 60 * 60 * 24,
        sameSite: 'none',
        secure: true,
    },
    store: new MongoStore({
        mongoUrl: process.env.MONGO_URL,
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native',
        crypto: {
            secret: process.env.CRYPTO_SECRET || '',
        }
    })
}))
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());
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
    passport.authenticate('google', { failureRedirect: '/login/failed', failureMessage: true, successRedirect: '/user'}),
);

app.get("/user", (req, res) => {
    if(req.isAuthenticated()){
        return res.send(req.user);
    }
    res.status(401).send('Not Authenticated')
})

app.get("/logout", (req, res, next) => {
    if (req.user) {
        req.logout((err) => {
            if(err) {return next(err)}
            res.send('done')
        });
    }
})

app.get("/health", (req, res) => {
    res.status(200).send('healthy')
})

app.use(routes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from './lib/passport';

import * as middlewares from './middlewares';
import routes from './routes';
import MessageResponse from './interfaces/MessageResponse';


require('./config');

const app = express();

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET || '',
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
        mongoUrl: process.env.MONGO_URL,
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native',
        crypto: {
            secret: process.env.CRYPTO_SECRET || '',
        }
    })
}))

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session())



app.get<{}, MessageResponse>('/', (req, res) => {
    console.log(req.user)
    res.json({
        message: '',
    });
});

app.get('/login/google', passport.authenticate('google', {
    accessType: 'offline',
    prompt: 'consent',
}));

app.get('/oauth2/redirect/google',
    passport.authenticate('google', { failureRedirect: '/login', failureMessage: true}),
    function(req, res) {
        res.redirect('/');
    }
);

app.use(routes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
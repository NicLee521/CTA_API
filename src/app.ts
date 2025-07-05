import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import * as middlewares from './middlewares.js';
import routes from './routes/index.js';


import './config.js'; 
import 'express-async-errors'
const app = express();
app.set('trust proxy', 2)
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(middlewares.addLogger);

app.get("/user", middlewares.authenticateToken, (req: any, res) => {
    if(req.user) {
        return res.status(200).json(req.user);
    }
})

app.get("/health", (req, res) => {
    res.status(200).send('healthy')
})

app.use(routes);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;

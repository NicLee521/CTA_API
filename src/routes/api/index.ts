import Router from 'express-promise-router';
import {authenticateToken} from '../../middlewares.js';
import story from './story.js';

const router = Router();

router.use(authenticateToken)

router.use('/story', story);

export default router;

import Router from 'express-promise-router';
import {authenticateToken} from '../../middlewares';
import story from './story';

const router = Router();

router.use(authenticateToken)

router.use('/story', story);

export default router;

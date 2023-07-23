import Router from 'express-promise-router';
import {validateUser} from '../../middlewares';
import story from './story';

const router = Router();

router.use(validateUser)

router.use('/story', story);

export default router;

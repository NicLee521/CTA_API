import Router from 'express-promise-router';
import {validateUser} from '../../middlewares';
import MessageResponse from '../../interfaces/MessageResponse';
import story from './story';

const router = Router();

router.get<{}, MessageResponse>('/', (req, res) => {
    res.json({
        message: 'API',
    });
});

router.use(validateUser)

router.use('/story', story);



export default router;

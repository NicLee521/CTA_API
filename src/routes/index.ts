import Router from 'express-promise-router';

import api from './api';

const router = Router();

router.use('/api', api);

export default router;

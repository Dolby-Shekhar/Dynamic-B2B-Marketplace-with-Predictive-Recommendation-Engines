import { Router } from 'express';

import authRouter from './auth.routes';
import marketplaceRouter from './marketplace.routes';

const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/marketplace', marketplaceRouter);

export default apiRouter;

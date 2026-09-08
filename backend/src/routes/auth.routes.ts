import { Router } from 'express';

import {
  login,
  logout,
  me,
  onboardVendor,
  refreshToken,
  register,
} from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/refresh-token', refreshToken);
authRouter.post('/vendor/onboard', requireAuth, onboardVendor);
authRouter.get('/me', requireAuth, me);

export default authRouter;

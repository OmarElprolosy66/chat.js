import { Router } from 'express';
import { authenticateJWT } from '../app/http/middlewares/jwt.middleware';
import authRoutesV1 from './v1/auth.routes';
import userRoutesV1 from './v1/user.routes';
const router = Router();

// V1 auth
router.use('/v1/auth', authRoutesV1);

// V1 routes
// apply auth middleware for all subsequent routes (v1 users)
router.use(authenticateJWT);
router.use('/v1/users', userRoutesV1);

export default router;
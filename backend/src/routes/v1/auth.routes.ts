import { NextFunction, Request, Response, Router } from "express";
import { resolveController } from '../../app/http/middlewares/resolve-controller.middleware';
import AuthController from "../../app/http/controllers/auth.controller";

export const router = Router();

declare global {
  namespace Express {
    interface Request {
      authController: AuthController;
    }
  }
}
router.post('/register',
    resolveController('authController'),
    (req: Request, res: Response, next: NextFunction) =>  req.authController.register(req, res, next));
router.post('/login',
    resolveController('authController'),
    (req: Request, res: Response, next: NextFunction) => req.authController.login(req, res, next));
// router.post('/google/register', container.cradle.authController.);
// router.post('/google/login', container.cradle.authController.);

export default router;
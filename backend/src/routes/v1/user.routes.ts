import { NextFunction, Request, Response, Router } from 'express';
import { validate } from '../../app/http/middlewares/validate.middleware';
import { resolveController } from '../../app/http/middlewares/resolve-controller.middleware';
import { UpdateUserSchema } from '../../db/validators/user.validator';
import { UserController } from '../../app/http/controllers/user.controller';
import { isOwnerGuard } from '../../app/http/middlewares/auth.middleware';

declare global {
  namespace Express {
    interface Request {
      userController: UserController;
    }
  }
}

export const router = Router();

router.use('/:id', isOwnerGuard);
router.get('/:id',
    resolveController('userController'),
    (req: Request, res: Response, next: NextFunction) => req.userController.getById(req, res, next));
router.post('/:id', validate(UpdateUserSchema),
    resolveController('userController'),
    (req: Request, res: Response, next: NextFunction) => req.userController.update(req, res, next));
router.delete('/:id',
    resolveController('userController'),
    (req: Request, res: Response, next: NextFunction) => req.userController.delete(req, res, next));

export default router;
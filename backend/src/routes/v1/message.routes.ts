import { Router } from 'express';
import { resolveController } from '../../app/http/middlewares/resolve-controller.middleware';
import { Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/:partnerId',
    resolveController('messageController'),
    (req: Request, res: Response, next: NextFunction) => (req as any).messageController.getConversation(req, res, next)
);

export default router;

import { Router } from 'express';
import { resolveController } from '../../app/http/middlewares/resolve-controller.middleware';
import { Request, Response, NextFunction } from 'express';

const router = Router();

router.get('/blocked',
    resolveController('contactsController'),
    (req: Request, res: Response, next: NextFunction) => (req as any).contactsController.getBlocked(req, res, next)
);

router.post('/block',
    resolveController('contactsController'),
    (req: Request, res: Response, next: NextFunction) => (req as any).contactsController.block(req, res, next)
);

router.post('/unblock',
    resolveController('contactsController'),
    (req: Request, res: Response, next: NextFunction) => (req as any).contactsController.unblock(req, res, next)
);

router.get('/',
    resolveController('contactsController'),
    (req: Request, res: Response, next: NextFunction) => (req as any).contactsController.getContacts(req, res, next)
);

router.post('/add',
    resolveController('contactsController'),
    (req: Request, res: Response, next: NextFunction) => (req as any).contactsController.addFriend(req, res, next)
);

export default router;

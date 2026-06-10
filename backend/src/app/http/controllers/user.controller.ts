import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/user.service';
import type { CreateUserDTO, UpdateUserDTO } from '../../../db/DTOs';

export class UserController {
    constructor(private userService: UserService) {}

    async getById(req: Request, res: Response, next: NextFunction) {
        try {
            const id   = req.params.id;
            const user = await this.userService.getUserById(id);
            if (!user) return res.sendStatus(404);
            return res.json(user);
        } catch (err) { next(err); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id  = req.params.id;
            const dto = req.body as UpdateUserDTO;
            const updated = await this.userService.updateUser(id, dto);
            if (!updated) return res.sendStatus(404);
            return res.json(updated);
        } catch (err) { next(err); }
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            await this.userService.deleteUser(id);
            return res.sendStatus(204);
        } catch (err) { next(err); }
    }
}

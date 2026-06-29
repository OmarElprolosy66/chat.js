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

    async getByEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const email = req.query.email as string;
            if (!email) return res.status(400).json({ message: "Email query parameter is required" });
            const user = await this.userService.getByEmail(email);
            if (!user) return res.status(404).json({ message: "User not found" });
            const { password, ...cleanUser } = user;
            return res.json(cleanUser);
        } catch (err) { next(err); }
    }
}

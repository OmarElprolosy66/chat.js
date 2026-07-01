import { Request, Response, NextFunction } from "express";
import { ContactsService } from "../../services/contacts.service";

export class ContactsController {
    constructor(private contactsService: ContactsService) {}

    async block(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, targetId } = req.body;
            const currentUserId = (req as any).user.user_id;

            const blockedUserId = await this.contactsService.blockUser(currentUserId, email, targetId);
            return res.status(200).json({ message: "User blocked successfully", id: blockedUserId });
        } catch (err: any) {
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return next(err);
        }
    }

    async unblock(req: Request, res: Response, next: NextFunction) {
        try {
            const { targetId } = req.body;
            const currentUserId = (req as any).user.user_id;

            await this.contactsService.unblockUser(currentUserId, targetId);
            return res.status(200).json({ message: "User unblocked successfully" });
        } catch (err: any) {
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return next(err);
        }
    }

    async getBlocked(req: Request, res: Response, next: NextFunction) {
        try {
            const currentUserId = (req as any).user.user_id;
            const blocked = await this.contactsService.getBlockedUsers(currentUserId);
            return res.status(200).json(blocked);
        } catch (err) {
            return next(err);
        }
    }

    async getContacts(req: Request, res: Response, next: NextFunction) {
        try {
            const currentUserId = (req as any).user.user_id;
            const contacts = await this.contactsService.getContacts(currentUserId);
            return res.status(200).json(contacts);
        } catch (err) {
            return next(err);
        }
    }

    async addFriend(req: Request, res: Response, next: NextFunction) {
        try {
            const { targetId } = req.body;
            const currentUserId = (req as any).user.user_id;
            await this.contactsService.addFriend(currentUserId, targetId);
            return res.status(200).json({ message: "Contact added as friend successfully" });
        } catch (err: any) {
            if (err.status) {
                return res.status(err.status).json({ message: err.message });
            }
            return next(err);
        }
    }
}

export default ContactsController;

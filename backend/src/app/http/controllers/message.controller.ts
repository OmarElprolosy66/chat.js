import { Request, Response, NextFunction } from "express";
import { MessageService } from "../../services/message.service";

export class MessageController {
    constructor(private messageService: MessageService) {}

    async getConversation(req: Request, res: Response, next: NextFunction) {
        try {
            const partnerId = req.params.partnerId;
            const currentUserId = (req as any).user.user_id;

            if (!partnerId) {
                return res.status(400).json({ message: "Partner ID is required" });
            }

            const messages = await this.messageService.getConversation(currentUserId, partnerId);
            return res.status(200).json(messages);
        } catch (err) {
            return next(err);
        }
    }
}

export default MessageController;

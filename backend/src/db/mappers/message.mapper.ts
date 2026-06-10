import type {
    CreateMessageDTO,
    EditMessageDTO,
    ResponseMessageDTO
} from "../DTOs/message.dto";
import { messageSchema } from "../schema";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type MessageEntity = InferSelectModel<typeof messageSchema>;
export type NewMessageDB  = InferInsertModel<typeof messageSchema>;

export const toMessageResponse = (message: MessageEntity): ResponseMessageDTO => {
    return {
        id: message.id,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        content: message.content,
        status: message.status
    }
}


import { db } from "../../../db/db";
import type { CreateMessageDTO, ResponseMessageDTO, EditMessageDTO } from "../../../db/DTOs/message.dto";
import { messageSchema } from "../../../db/schema";
import { IMessageRepository } from "../../interfaces/repositories/IMessageRepository";
import { MessageEntity , toMessageResponse } from "../../../db/mappers/message.mapper";
import { eq, or, and, asc } from "drizzle-orm";

export class MessageRepository implements IMessageRepository {
    async create(dto: CreateMessageDTO): Promise<ResponseMessageDTO> {
        const message = await db
            .insert(messageSchema)
            .values({
                sender_id: dto.sender_id,
                receiver_id: dto.receiver_id,
                content: dto.content,
                status: dto.status
            }).returning();

        return toMessageResponse(message[0] as MessageEntity);
    }
    async update(dto: EditMessageDTO): Promise<ResponseMessageDTO> {
        const messages = await db
            .update(messageSchema)
            .set({ content: dto.content })
            .where(eq(messageSchema.id, dto.id))
            .returning();
        
        if (!messages || messages.length === 0) throw new Error('Message not found');
        return toMessageResponse(messages[0] as MessageEntity);
    }
    async getConversation(user1Id: string, user2Id: string): Promise<ResponseMessageDTO[]> {
        const messages = await db
            .select()
            .from(messageSchema)
            .where(
                or(
                    and(eq(messageSchema.sender_id, user1Id), eq(messageSchema.receiver_id, user2Id)),
                    and(eq(messageSchema.sender_id, user2Id), eq(messageSchema.receiver_id, user1Id))
                )
            )
            .orderBy(asc(messageSchema.createdAt));

        return messages.map((m) => toMessageResponse(m as MessageEntity));
    }   
}

export default MessageRepository;
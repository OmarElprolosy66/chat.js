import {
    CreateMessageDTO,
    ResponseMessageDTO,
    EditMessageDTO
} from "../../../db/DTOs/message.dto";

export interface IMessageRepository {
    create(dto: CreateMessageDTO): Promise<ResponseMessageDTO>;
    update(dto: EditMessageDTO): Promise<ResponseMessageDTO>;
    getConversation(user1Id: string, user2Id: string): Promise<ResponseMessageDTO[]>;
}
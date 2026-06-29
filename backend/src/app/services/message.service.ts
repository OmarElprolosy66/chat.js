import { IMessageRepository } from "../interfaces/repositories/IMessageRepository";
import { CreateMessageDTO, EditMessageDTO, ResponseMessageDTO } from '../../db/DTOs';

export class MessageService {
    constructor(private messageRepo: IMessageRepository) {}

    async createMessage(dto: CreateMessageDTO): Promise<ResponseMessageDTO> {
        return await this.messageRepo.create(dto);
    }

    async updateMessage(dto: EditMessageDTO): Promise<ResponseMessageDTO> {
        return await this.messageRepo.update(dto);
    }

    async getConversation(user1Id: string, user2Id: string): Promise<ResponseMessageDTO[]> {
        return await this.messageRepo.getConversation(user1Id, user2Id);
    }
}

export default MessageService;
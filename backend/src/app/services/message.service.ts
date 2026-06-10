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
}

export default MessageService;
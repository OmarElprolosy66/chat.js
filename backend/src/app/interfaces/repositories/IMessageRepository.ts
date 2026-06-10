import {
    CreateMessageDTO,
    ResponseMessageDTO,
    EditMessageDTO
} from "../../../db/DTOs/message.dto";

export interface IMessageRepository {
    create(dto: CreateMessageDTO): Promise<ResponseMessageDTO>;
    update(dto: EditMessageDTO): Promise<ResponseMessageDTO>;
}
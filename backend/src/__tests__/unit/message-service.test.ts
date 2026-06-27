import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MessageService } from '../../app/services/message.service';
import type { IMessageRepository } from '../../app/interfaces/repositories/IMessageRepository';
import { CreateMessageDTO, EditMessageDTO, ResponseMessageDTO } from '../../db/DTOs';

const mockMessageRepo: IMessageRepository = {
    create: vi.fn(),
    update: vi.fn(),
};

describe('MessageService - Unit Tests', () => {
    let messageService: MessageService;

    beforeEach(() => {
        vi.clearAllMocks();
        messageService = new MessageService(mockMessageRepo);
    });

    it('should create a message successfully', async () => {
        const dto: CreateMessageDTO = {
            sender_id: 'sender-123',
            receiver_id: 'receiver-456',
            content: 'Hello friend',
        };

        const mockResponse: ResponseMessageDTO = {
            id: 'msg-789',
            sender_id: dto.sender_id,
            receiver_id: dto.receiver_id,
            content: dto.content,
            status: 'sent',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        vi.spyOn(mockMessageRepo, 'create').mockResolvedValue(mockResponse);

        const result = await messageService.createMessage(dto);

        expect(mockMessageRepo.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(mockResponse);
    });

    it('should update a message successfully', async () => {
        const dto: EditMessageDTO = {
            id: 'msg-789',
            content: 'Updated content',
        };

        const mockResponse: ResponseMessageDTO = {
            id: dto.id,
            sender_id: 'sender-123',
            receiver_id: 'receiver-456',
            content: dto.content,
            status: 'sent',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        vi.spyOn(mockMessageRepo, 'update').mockResolvedValue(mockResponse);

        const result = await messageService.updateMessage(dto);

        expect(mockMessageRepo.update).toHaveBeenCalledWith(dto);
        expect(result).toEqual(mockResponse);
    });
});

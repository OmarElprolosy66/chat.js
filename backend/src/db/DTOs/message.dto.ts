import { z } from 'zod';
import {
    CreateMessageSchema,
    EditMessageSchema
} from '../validators/message.validator';

export type CreateMessageDTO = z.infer<typeof CreateMessageSchema>;
export type EditMessageDTO   = z.infer<typeof EditMessageSchema>;
export type ResponseMessageDTO = { id: string } & CreateMessageDTO;

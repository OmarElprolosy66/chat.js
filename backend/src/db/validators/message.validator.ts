import { z } from 'zod';

export const CreateMessageSchema = z.object({
    sender_id: z.uuid('sender_id').nonempty().trim(),
    receiver_id: z.uuid('receiver_id').nonempty().trim(),
    content: z.string('content').nonempty().min(1).max(2000).trim(),
    status: z.enum(['sent', 'delivered', 'read']).default('sent').nonoptional(),
});

export const EditMessageSchema = z.object({
    id: z.uuid().nonempty().trim(),
    content: z.string('content').min(1).max(2000).trim().optional(),
    status: z.enum(['sent', 'delivered', 'read']).default('sent').nonoptional(),
});
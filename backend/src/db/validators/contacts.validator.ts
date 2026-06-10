import { z } from 'zod';

export const CreateContactSchema = z.object({
    user_id: z.uuid(),
    other_id: z.uuid(),
    relation_type: z.enum(['friend', 'blocked']).default('friend'),
    isFavorite: z.boolean().default(false),
});

export const UpdateContactSchema = z.object({
    relation_type: z.enum(['friend', 'blocked']).default('friend'),
    isFavorite: z.boolean().default(false),
});
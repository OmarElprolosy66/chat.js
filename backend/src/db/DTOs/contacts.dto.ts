import { z } from 'zod';
import { CreateContactSchema, UpdateContactSchema } from '../validators/contacts.validator';

export type CreateContactDTO = z.infer<typeof CreateContactSchema>;

export type UpdateContactDTO = z.infer<typeof UpdateContactSchema>;

import { contactsSchema } from '../schema';
import { CreateContactDTO, UpdateContactDTO } from '../DTOs/contacts.dto';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type ContactEntity = InferSelectModel<typeof contactsSchema>;
export type NewContactDB  = InferInsertModel<typeof contactsSchema>;

export const toCreateContactDTO = (contact: ContactEntity): CreateContactDTO => ({
    user_id: contact.user_id,
    other_id: contact.other_id,
    relation_type: contact.relation_type,
    isFavorite: contact.isFavorite ?? false,
});

export const toUpdateContactDTO = (contact: NewContactDB): UpdateContactDTO => ({
    relation_type: contact.relation_type ?? 'friend',
    isFavorite: contact.isFavorite ?? false,
});
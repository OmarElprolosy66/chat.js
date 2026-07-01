import {
    pgTable,
    uuid,
    text,
    timestamp,
    varchar,
    boolean,
    primaryKey,
    index,
    uniqueIndex,
    pgEnum,
    check
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

/* TODO: handel oauth in users table */
// CREATE TABLE users (
//     id BIGINT PRIMARY KEY AUTO_INCREMENT,
//     email VARCHAR(255),
//     username VARCHAR(100),
//     password_hash VARCHAR(255),  -- null for OAuth users
//     provider VARCHAR(50) NOT NULL,           -- "google" or "apple"
//     provider_user_id VARCHAR(255) NOT NULL,  -- the unique ID from provider
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     UNIQUE (provider, provider_user_id)      -- prevents duplicate OAuth accounts
// );
export const userSchema = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom().unique(),
    username: varchar('username', { length: 50 }).notNull(),
    email: varchar('email', { length: 200 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
}, table => [
    index('idx_username').on(table.username),
    uniqueIndex('idx_email').on(table.email),
]);

export const relationEnum = pgEnum('relation_type', ['friend', 'blocked']);

export const contactsSchema = pgTable('contacts', {
    user_id: uuid('user_id')
        .references(() => userSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    other_id: uuid('other_id')
        .references(() => userSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    relation_type: relationEnum('relation_type').default('friend').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    isFavorite: boolean('is_favorite').default(false).notNull(),
    blockedBy: uuid('blocked_by')
        .references(() => userSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
}, table => [
    primaryKey({ columns: [table.user_id, table.other_id] }),
    check('user_id_lt_other_id', sql`${table.user_id} < ${table.other_id}`),
    index('idx_user').on(table.user_id),
    index('idx_other').on(table.other_id),
]);

export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);

export const messageSchema = pgTable('messages', {
    id: uuid('id').primaryKey().defaultRandom().unique(),
    sender_id: uuid('sender_id')
        .references(() => userSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    receiver_id: uuid('receiver_id')
        .references(() => userSchema.id, { onDelete: 'cascade', onUpdate: 'cascade' })
        .notNull(),
    content: text('content').notNull(),
    status: messageStatusEnum('status').default('sent').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// relationships
export const userRelations = relations(userSchema, ({ many }) => {
    return {
        contacts: many(contactsSchema),
        sentMessages: many(messageSchema),
        receivedMessages: many(messageSchema),
    }
});

export const contactRelations = relations(contactsSchema, ({ one }) => {
    return {
        user: one(userSchema, {
            fields: [contactsSchema.user_id],
            references: [userSchema.id],
        }),
        otherUser: one(userSchema, {
            fields: [contactsSchema.other_id],
            references: [userSchema.id],
        }),
    };
});

export const messageRelations = relations(messageSchema, ({ one }) => {
    return {
        sender: one(userSchema, {
            fields: [messageSchema.sender_id],
            references: [userSchema.id],
        }),
        receiver: one(userSchema, {
            fields: [messageSchema.receiver_id],
            references: [userSchema.id],
        }),
    };
});
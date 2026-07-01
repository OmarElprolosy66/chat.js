import { db } from "../../../db/db";
import { contactsSchema, userSchema, messageSchema } from "../../../db/schema";
import { eq, and, or, sql, ne, exists } from "drizzle-orm";

export class ContactsRepository {
    async getContactsAndConversations(userId: string): Promise<any[]> {
        // 1. Fetch all unique users who have exchanged messages with this user OR are marked as friends
        const users = await db
            .select({
                id: userSchema.id,
                username: userSchema.username,
                email: userSchema.email,
            })
            .from(userSchema)
            .where(
                and(
                    ne(userSchema.id, userId),
                    or(
                        exists(
                            db
                                .select()
                                .from(contactsSchema)
                                .where(
                                    and(
                                        eq(contactsSchema.relation_type, 'friend'),
                                        or(
                                            and(eq(contactsSchema.user_id, userId), eq(contactsSchema.other_id, userSchema.id)),
                                            and(eq(contactsSchema.other_id, userId), eq(contactsSchema.user_id, userSchema.id))
                                        )
                                    )
                                )
                        ),
                        exists(
                            db
                                .select()
                                .from(messageSchema)
                                .where(
                                    or(
                                        and(eq(messageSchema.sender_id, userId), eq(messageSchema.receiver_id, userSchema.id)),
                                        and(eq(messageSchema.receiver_id, userId), eq(messageSchema.sender_id, userSchema.id))
                                    )
                                )
                        )
                    )
                )
            );

        const results = [];
        for (const u of users) {
            const uId = userId < u.id ? userId : u.id;
            const oId = userId < u.id ? u.id : userId;

            const rel = await db
                .select()
                .from(contactsSchema)
                .where(
                    and(
                        eq(contactsSchema.user_id, uId),
                        eq(contactsSchema.other_id, oId)
                    )
                )
                .limit(1);

            let isPending = true;
            let isBlocked = false;

            if (rel.length > 0) {
                if (rel[0].relation_type === 'friend') {
                    isPending = false;
                } else if (rel[0].relation_type === 'blocked') {
                    isBlocked = true;
                }
            }

            if (!isBlocked) {
                results.push({
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    isPending,
                });
            }
        }
        return results;
    }
    async addFriend(userId: string, targetId: string): Promise<void> {
        const uId = userId < targetId ? userId : targetId;
        const oId = userId < targetId ? targetId : userId;
        
        await db
            .insert(contactsSchema)
            .values({
                user_id: uId,
                other_id: oId,
                relation_type: 'friend',
            })
            .onConflictDoUpdate({
                target: [contactsSchema.user_id, contactsSchema.other_id],
                set: {
                    relation_type: 'friend',
                    blockedBy: null,
                    updatedAt: new Date(),
                }
            });
    }

    async blockUser(userId: string, targetId: string): Promise<void> {
        const uId = userId < targetId ? userId : targetId;
        const oId = userId < targetId ? targetId : userId;
        
        await db
            .insert(contactsSchema)
            .values({
                user_id: uId,
                other_id: oId,
                relation_type: 'blocked',
                blockedBy: userId,
            })
            .onConflictDoUpdate({
                target: [contactsSchema.user_id, contactsSchema.other_id],
                set: {
                    relation_type: 'blocked',
                    blockedBy: userId,
                    updatedAt: new Date(),
                }
            });
    }

    async unblockUser(userId: string, targetId: string): Promise<void> {
        const uId = userId < targetId ? userId : targetId;
        const oId = userId < targetId ? targetId : userId;
        
        await db
            .delete(contactsSchema)
            .where(
                and(
                    eq(contactsSchema.user_id, uId),
                    eq(contactsSchema.other_id, oId),
                    eq(contactsSchema.blockedBy, userId)
                )
            );
    }

    async isBlocked(senderId: string, receiverId: string): Promise<boolean> {
        const uId = senderId < receiverId ? senderId : receiverId;
        const oId = senderId < receiverId ? receiverId : senderId;
        
        const relation = await db
            .select()
            .from(contactsSchema)
            .where(
                and(
                    eq(contactsSchema.user_id, uId),
                    eq(contactsSchema.other_id, oId),
                    eq(contactsSchema.relation_type, 'blocked'),
                    eq(contactsSchema.blockedBy, receiverId)
                )
            )
            .limit(1);
            
        return relation.length > 0;
    }

    async getBlockedUsers(userId: string): Promise<any[]> {
        const blockedUsers = await db
            .select({
                id: userSchema.id,
                username: userSchema.username,
                email: userSchema.email,
            })
            .from(contactsSchema)
            .innerJoin(
                userSchema,
                sql`${userSchema.id} = case when ${contactsSchema.user_id} = ${userId} then ${contactsSchema.other_id} else ${contactsSchema.user_id} end`
            )
            .where(
                and(
                    eq(contactsSchema.relation_type, 'blocked'),
                    eq(contactsSchema.blockedBy, userId)
                )
            );

        return blockedUsers;
    }
}

export default ContactsRepository;
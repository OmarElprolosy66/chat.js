import { ContactsRepository } from "../repositories/drizzle/contacts.repository";
import UserRepository from "../repositories/drizzle/user.repository";

export class ContactsService {
    constructor(
        private contactsRepo: ContactsRepository,
        private userRepo: UserRepository
    ) {}

    async blockUser(currentUserId: string, email?: string, targetId?: string): Promise<string> {
        let blockUserId = targetId;

        if (email) {
            const targetUser = await this.userRepo.findByEmail(email);
            if (!targetUser) {
                const error = new Error("User not found with this email");
                (error as any).status = 404;
                throw error;
            }
            blockUserId = targetUser.id;
        }

        if (!blockUserId) {
            const error = new Error("Email or targetId is required");
            (error as any).status = 400;
            throw error;
        }

        if (blockUserId === currentUserId) {
            const error = new Error("You cannot block yourself");
            (error as any).status = 400;
            throw error;
        }

        await this.contactsRepo.blockUser(currentUserId, blockUserId);
        return blockUserId;
    }

    async unblockUser(currentUserId: string, targetId: string): Promise<void> {
        if (!targetId) {
            const error = new Error("targetId is required");
            (error as any).status = 400;
            throw error;
        }
        await this.contactsRepo.unblockUser(currentUserId, targetId);
    }

    async getBlockedUsers(currentUserId: string): Promise<any[]> {
        return await this.contactsRepo.getBlockedUsers(currentUserId);
    }

    async getContacts(userId: string): Promise<any[]> {
        return await this.contactsRepo.getContactsAndConversations(userId);
    }

    async addFriend(userId: string, targetId: string): Promise<void> {
        if (!targetId) {
            const error = new Error("targetId is required");
            (error as any).status = 400;
            throw error;
        }
        await this.contactsRepo.addFriend(userId, targetId);
    }
}

export default ContactsService;

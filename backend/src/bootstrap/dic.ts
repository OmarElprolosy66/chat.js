import {
    createContainer,
    asClass,
    asFunction,
    asValue,
    InjectionMode,
} from 'awilix';
import UserRepository from '../app/repositories/drizzle/user.repository';
import MessageRepository from '../app/repositories/drizzle/message.repository';
import ContactsRepository from '../app/repositories/drizzle/contacts.repository';
import UserService from '../app/services/user.service';
import MessageService from '../app/services/message.service';
import ContactsService from '../app/services/contacts.service';
import { UserController } from '../app/http/controllers/user.controller';
import { AuthController } from '../app/http/controllers/auth.controller';
import { MessageController } from '../app/http/controllers/message.controller';
import { ContactsController } from '../app/http/controllers/contacts.controller';
import { WebSocketController } from '../app/websocket/WebSocketController';
import { ConnectionManager } from '../app/websocket/ConnectionManager';
import { db } from '../db/db';

export function makeContainer() {
    const container = createContainer({
        injectionMode: InjectionMode.CLASSIC,
    });

    container.register({
        userRepo: asClass(UserRepository).scoped(),
        messageRepo: asClass(MessageRepository).scoped(),
        contactsRepo: asClass(ContactsRepository).scoped(),
        userService: asClass(UserService).singleton(),
        messageService: asClass(MessageService).singleton(),
        contactsService: asClass(ContactsService).singleton(),
        userController: asClass(UserController).scoped(),
        authController: asClass(AuthController).scoped(),
        messageController: asClass(MessageController).scoped(),
        contactsController: asClass(ContactsController).scoped(),
        connectionManager: asClass(ConnectionManager).singleton(),
        webSocketController: asClass(WebSocketController).singleton(),
        db: asValue(db),
    });

    return container;
}
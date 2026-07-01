import jwt from "jsonwebtoken";
import UserService from "../services/user.service";
import MessageService from "../services/message.service";
import ContactsRepository from "../repositories/drizzle/contacts.repository";
import ConnectionManager, { WS } from "./ConnectionManager";
import { CreateMessageDTO } from "../../db/DTOs/message.dto";
import { CreateMessageSchema } from "../../db/validators";
import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { verifyToken } from "../utils/auth.util";

export class WebSocketController {
    private readonly wss = new WebSocketServer({ noServer: true });

    constructor(
        private connectionManager: ConnectionManager,
        private userService: UserService,
        private messageService: MessageService,
        private contactsRepo: ContactsRepository,
    ) { }

    private server!: Server;

    initialize(server: Server) {
        this.server = server;
        this.configConn();
    }

    private onSocketPreError(e: Error) {
        console.error(e);
    }

    private onSocketPostError(e: Error) {
        console.error(e);
    }

    private validateToken(token: string, req: any): boolean {
        try {
            const payload = verifyToken(token);
            req.user = payload;
            return true;
        } catch (err) {
            return false;
        }
    }

    configConn() {
        this.server.on('upgrade', (req, socket, head) => {
            socket.on('error', this.onSocketPreError);
            // Use a dummy base URL to reliably parse query parameters from the request URL.
            const searchParams = new URL(req.url as string, `http://${req.headers.host}`).searchParams;
            const token = searchParams.get('token');
            
            if (!token || !this.validateToken(token, req)) { // Check for token and validate it
                console.warn('WebSocket connection rejected: Invalid or missing token.');
                socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
                socket.destroy();
                return;
            }

            this.wss.handleUpgrade(req, socket, head, (ws) => {
                socket.removeListener('error', this.onSocketPreError);
                this.wss.emit('connection', ws, req);
            })
        });
        
        this.wss.on('connection', this.onConnection);
    }
    
    // Use an arrow function to preserve 'this' context from the class instance.
    private onConnection = (ws: WS, req: any) => {
        ws.on('error', this.onSocketPostError);
    
        const userId = req.user.user_id;
        this.connectionManager.add(userId, ws);
        
        const onMessage = async (data: any) => {
            try {
                const messageData = JSON.parse(data.toString());
                // Enforce sender_id from the authenticated user's token
                messageData.sender_id = userId;
                const result = CreateMessageSchema.safeParse(messageData as CreateMessageDTO);
                if (!result.success) {
                    console.error('Validation error on WebSocket message:', result.error.issues);
                    ws.send(JSON.stringify({ error: "Invalid message format", details: result.error.message }));
                    return;
                }

                // Check if receiver blocked sender
                const isBlocked = await this.contactsRepo.isBlocked(userId, result.data.receiver_id);
                if (isBlocked) {
                    console.warn(`WebSocket message blocked: Receiver ${result.data.receiver_id} has blocked Sender ${userId}.`);
                    ws.send(JSON.stringify({ error: "Message blocked", details: "You are blocked by this user." }));
                    return;
                }

                const createdMessage = await this.messageService.createMessage(result.data);
                
                // Fetch sender details to assist receiver in dynamically adding unadded senders
                const senderUser = await this.userService.getUserById(userId);

                // Broadcast the newly created message to the receiver if they are online
                const receiverSockets = this.connectionManager.getSockets(createdMessage.receiver_id);
                if (receiverSockets.length > 0) {
                    const broadcastPayload = {
                        ...createdMessage,
                        sender_username: senderUser?.username || "Unknown",
                        sender_email: senderUser?.email || ""
                    };
                    this.connectionManager.broadcastToUser(receiverSockets, broadcastPayload);
                }
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
                ws.send(JSON.stringify({ error: 'Failed to process message.' }));
            }
        };
        ws.on('message', onMessage);
    }
}

export default WebSocketController;
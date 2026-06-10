
export type WS = import('ws').WebSocket;

export class ConnectionManager {
    private clients = new Map<string, Set<WS>>; // one user could have more than one device
    private channelSubscriptions = new Map<string, Set<string>>;

    // ... methods to subscribe/unsubscribe a user to a channel

    public getOnlineMembers(channelId: string): WS[] {
        const memberIds = this.channelSubscriptions.get(channelId) ?? new Set();
        const onlineSockets: WS[] = [];
        for (const userId of memberIds) {
            const userSockets = this.clients.get(userId) ?? [];
            onlineSockets.push(...userSockets);
        }
        return onlineSockets;
    }
    
    add(userId: string, socket: WS) {
        let set = this.clients.get(userId);
        if (!set) {
            set = new Set();
            this.clients.set(userId, set);
        }

        set.add(socket);
        socket.on('close', _ => this.remove(userId, socket));
    }

    remove(userId: string, socket: WS) {
        const set = this.clients.get(userId);
        if (!set) return;
        set.delete(socket);
        if (set.size === 0) this.clients.delete(userId);
    }

    getSockets(userId: string) {
        return Array.from(this.clients.get(userId) ?? []);
    }

    broadcastToUser(userSockets: WS[], message: any) {
        for (const socket of userSockets) {
            if (socket.readyState === socket.OPEN) {
                console.log(message);
                socket.send(JSON.stringify(message));
                // TODO: handel sending messages that was sent when user was offline
            }
            else {
                // TODO: store messages if the reciver is offline
            }
        }
    }
}

export default ConnectionManager;
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConnectionManager, WS } from '../../app/websocket/ConnectionManager';

// Mock ws WebSocket object
function createMockSocket(): WS {
    return {
        readyState: 1, // OPEN
        send: vi.fn(),
        on: vi.fn(),
        close: vi.fn(),
    } as unknown as WS;
}

describe('ConnectionManager - Unit Tests', () => {
    let manager: ConnectionManager;

    beforeEach(() => {
        manager = new ConnectionManager();
    });

    it('should add a socket connection for a user', () => {
        const userId = 'user-123';
        const socket = createMockSocket();

        manager.add(userId, socket);

        const sockets = manager.getSockets(userId);
        expect(sockets).toHaveLength(1);
        expect(sockets[0]).toBe(socket);
        expect(socket.on).toHaveBeenCalledWith('close', expect.any(Function));
    });

    it('should handle multiple sockets for the same user (multi-device)', () => {
        const userId = 'user-123';
        const socket1 = createMockSocket();
        const socket2 = createMockSocket();

        manager.add(userId, socket1);
        manager.add(userId, socket2);

        const sockets = manager.getSockets(userId);
        expect(sockets).toHaveLength(2);
        expect(sockets).toContain(socket1);
        expect(sockets).toContain(socket2);
    });

    it('should remove a specific socket connection', () => {
        const userId = 'user-123';
        const socket1 = createMockSocket();
        const socket2 = createMockSocket();

        manager.add(userId, socket1);
        manager.add(userId, socket2);

        manager.remove(userId, socket1);

        const sockets = manager.getSockets(userId);
        expect(sockets).toHaveLength(1);
        expect(sockets[0]).toBe(socket2);
    });

    it('should fully remove user map if no connections remain', () => {
        const userId = 'user-123';
        const socket = createMockSocket();

        manager.add(userId, socket);
        manager.remove(userId, socket);

        const sockets = manager.getSockets(userId);
        expect(sockets).toHaveLength(0);
    });

    it('should broadcast messages to user sockets that are open', () => {
        const socket1 = createMockSocket();
        const socket2 = createMockSocket();
        
        // Mock socket states
        (socket1 as any).OPEN = 1;
        (socket2 as any).OPEN = 1;
        (socket1 as any).readyState = 1; // OPEN
        (socket2 as any).readyState = 0; // CONNECTING (not open)

        const testMessage = { text: 'hello' };

        manager.broadcastToUser([socket1, socket2], testMessage);

        expect(socket1.send).toHaveBeenCalledWith(JSON.stringify(testMessage));
        expect(socket2.send).not.toHaveBeenCalled();
    });
});

import app, { container } from './bootstrap/app';
import { WebSocketController } from './app/websocket/WebSocketController';
import http from 'http';

const server = http.createServer(app);
const wsController = container.resolve<WebSocketController>('webSocketController');
wsController.initialize(server);

server.listen(process.env.PORT, (): void => {
    console.log(`Server is running on port ${process.env.PORT}`);
});

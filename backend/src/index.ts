import app, { container } from './bootstrap/app';
import { WebSocketController } from './app/websocket/WebSocketController';
import http from 'http';

const server = http.createServer(app);
const wsController = container.resolve<WebSocketController>('webSocketController');
wsController.initialize(server);

server.listen(3000, (): void => {
    console.log(`Server is running on port ${process.env.APP_URL}`);
});

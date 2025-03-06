import { FastifyPluginAsync } from "fastify"
import { EventEmitter } from "stream";
import { WebSocket } from "ws"

export const clientSocketConnection = new WebSocket("ws://localhost:3001/api/socket");
export const socketEventEmitter = new EventEmitter();

const users: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
    fastify.register(import('@fastify/websocket'))

    fastify.get('/', { websocket: true }, (socket, req) => {
      socketEventEmitter.on('message', (message) => {
        clientSocketConnection.send(message);
      })
    })
}

export default users;

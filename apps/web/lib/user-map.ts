import type { WebSocket } from "ws";

// Store the client and user id in a map to keep track of the clients connected to the server
const userMap = new Map<string, WebSocket>();

const clientUserMap = globalThis.clientUserMap ?? userMap;
globalThis.clientUserMap = clientUserMap;

export default clientUserMap;

// Typing for globalThis
declare const globalThis: {
  clientUserMap: Map<string, WebSocket>;
} & typeof global;
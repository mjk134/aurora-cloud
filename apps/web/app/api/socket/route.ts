// Backend websocket route, this next js route will forward all websocket connections to this route and messages will be sent to the client
export const serverConnection = new WebSocket("ws://localhost:3000/socket");

export function SOCKET(
    client: import("ws").WebSocket,
    request: import("http").IncomingMessage,
    server: import("ws").WebSocketServer
  ) {
    console.log("A client connected");

    serverConnection.addEventListener("message", (event) => {
        console.log("Received message from server:", event.data);
        client.send(event.data);
    })
  
    client.on("message", (message) => {
      console.log("Received message:", message);
      serverConnection.send(message.toString());
    });
  
    client.on("close", () => {
      console.log("A client disconnected");
    });
  }

// Store the client and user id in a map to keep track of the clients connected to the server
export const clientUserMap = new Map<string, import("ws").WebSocket>();

// Promisified timeout function for initial message recieved from server
function timeout(ms: number, client: import("ws").WebSocket): Promise<null | import("ws").WebSocket.RawData> {
  return new Promise(resolve => {
    client.once("message", (message) => {
      resolve(message);
    });

    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

export async function SOCKET(
    client: import("ws").WebSocket,
    request: import("http").IncomingMessage,
    server: import("ws").WebSocketServer
  ) {
    const message = await timeout(5000, client);

    if (!message) {
      console.log("No init message received. Closing connection.");
      return client.close();
    }

    const data = JSON.parse(Buffer.from(message.toString(), 'base64').toString("utf-8")) as {
      server_id?: string;
      user_id?: string;
    };

    if (data.server_id) {
      // the key doesn't really matter, it's just a way to identify the server the data being sent over is already visible to the client either way it just forces the website to refresh
      if (data.server_id === "server") {
        console.log("Server connected + authed, ready to receive messages.");
        client.on("message", (message) => {
          console.log("Received message from client:", message);
          const jsonData = JSON.parse(message.toString());
          const userClient = clientUserMap.get(jsonData.user_id);
          if (userClient) {
            userClient.send(JSON.stringify(message)); // Stringify abstracts the message into a string 
          }
          
        })

        // Mainly for dev but useful cleanup
        client.on("close", () => {
          console.log("The server has disconnected.");
        });
      }
    } else if (data.user_id) {
      console.log('User connected:', data.user_id);
      clientUserMap.set(data.user_id, client);

      // Cleanup after user disconnects i.e user leaves the files page
      client.on("close", () => {
        console.log(`A user with id (${data.user_id}) has disconnected.`);
        clientUserMap.delete(data.user_id as string); // Typescript doesn't know that data.user_id is defined here so add type assertion
      });
    } else {
      client.close();
    }
  }
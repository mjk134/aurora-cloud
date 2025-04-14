import { tryCatchSync } from "@repo/util";
import clientUserMap from "../../../lib/user-map";
import type { IncomingMessage } from "http";
import type { WebSocketServer, WebSocket } from "ws";

// Promisified timeout function for initial message recieved from server
function timeout(
  ms: number,
  client: WebSocket,
): Promise<null | WebSocket.RawData> {
  return new Promise((resolve) => {
    client.once("message", (message) => {
      resolve(message);
    });

    setTimeout(() => {
      resolve(null);
    }, ms);
  });
}

type WebsocketInitEventData = {
  server_id?: string;
  user_id?: string;
};

export async function SOCKET(
  client: WebSocket,
  request: IncomingMessage,
  server: WebSocketServer,
) {
  const message = await timeout(5000, client);

  if (!message) {
    console.log("No init message received. Closing connection.");
    return client.close();
  }

  // Try catch just in case the message is not valid JSON
  const result = tryCatchSync<WebsocketInitEventData>(() => {
    const data = JSON.parse(
      Buffer.from(message.toString(), "base64").toString("utf-8"),
    ) as WebsocketInitEventData;
    // Just in case if nothing is sent over
    if (!data) {
      throw new Error("Invalid data");
    }
    // Check if data has the correct keys, since we know its not nothing and some sort of JSON
    if (!data.server_id && !data.user_id) {
      throw new Error("Invalid data");
    }
    return data;
  });

  if (!result.success) {
    console.log("Error parsing init message. Closing connection.");
    return client.close();
  }

  const data = result.value;

  if (data.server_id) {
    // the key doesn't really matter, it's just a way to identify the server the data being sent over is already visible to the client either way it just forces the website to refresh
    if (data.server_id === "server") {
      console.log("Server connected + authed, ready to receive messages.");
      client.on("message", (message) => {
        console.log(
          "Received message from server for client:",
          JSON.parse(message.toString()),
        );
        const jsonData = JSON.parse(message.toString());
        const userClient = clientUserMap.get(jsonData.user_id);
        if (userClient) {
          userClient.send(JSON.stringify(message)); // Stringify abstracts the message into a string
        }
      });

      // Mainly for dev but useful cleanup
      client.on("close", () => {
        console.log("The server has disconnected.");
      });
    }
  } else if (data.user_id) {
    console.log("User connected:", data.user_id);
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

import { join } from "path";
import "dotenv/config";
import AutoLoad, { AutoloadPluginOptions } from "@fastify/autoload";
import { FastifyPluginAsync, FastifyServerOptions } from "fastify";

import { Client } from "./handlers/discord/client";
import { TelegramClient } from "./handlers/telegram/client";
import { REST } from "./handlers/rest";
import WebSocket from "ws";
import { EventEmitter } from "events";

// Ensure environment variables are set
if (!process.env.TOKEN) {
  throw new Error("No token provided");
}

if (!process.env.TELEGRAM_TOKEN) {
  throw new Error("No telegram token provided");
}

const client = new Client(process.env.TOKEN!);
const tgClient = new TelegramClient(process.env.TELEGRAM_TOKEN!);
// For communication with Next server
const webhookRest = new REST({
  baseUrl: "http://localhost:3001/api",
});

// Forward to client
const clientSocketConnection = new WebSocket("ws://localhost:3001/api/socket");
const socketEventEmitter = new EventEmitter();

clientSocketConnection.once("open", () => {
  clientSocketConnection.send(
    Buffer.from(JSON.stringify({ server_id: "server" })).toString("base64"),
  );
});

clientSocketConnection.addEventListener("error", (error) => {
  console.log("Error in socket connection", error.message);
});

socketEventEmitter.on("message", (message) => {
  try {
    if (clientSocketConnection.OPEN) {
      clientSocketConnection.send(message);
    } else {
      // Reconnect
      clientSocketConnection.resume();
      // Check if event listener is already added
      if (!clientSocketConnection.listenerCount("open")) {
        clientSocketConnection.once("open", () => {
          clientSocketConnection.send(
            Buffer.from(JSON.stringify({ server_id: "server" })).toString(
              "base64",
            ),
          );
        });
      }
    }
  } catch (error) {
    // Don't log here, its already logged above. This just prevents the app from crashing.
  }
});

// The following lines are standard for fastify
export interface AppOptions
  extends FastifyServerOptions,
    Partial<AutoloadPluginOptions> {}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
  logger: true,
};

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts,
): Promise<void> => {
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "plugins"),
    options: opts,
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, "routes"),
    options: opts,
  });
};

export default app;
export { app, options, client, tgClient, webhookRest, socketEventEmitter };

# Aurora Cloud

Aurora Cloud offers the simplest way to store your data on social media CDNs such as Discord and Telegram (soon TikTok and YouTube). This way it is free and basicaly infinite. The only limitations are network speeds and the API limitations of the CDNs.

## Using this example

Make sure you set your environment variables in `.env` file for both client and server.

### Client .env
```env
POSTGRES_PRISMA_URL=""
POSTGRES_URL_NON_POOLING=""
```

### Server .env
```env
TOKEN=DISCORD_TOKEN
TELEGRAM_TOKEN=
```

### Server Environment Variables
Your discord bot token should be set in the `TOKEN` environment variable. You can create a bot and get the token from the [Discord Developer Portal](https://discord.com/developers/applications). For the telegram bot token, you can create a bot using the [BotFather](https://core.telegram.org/bots#botfather) and get the token from there.

### Database
You will also need a Neon database. You can create one for free at [neon.tech](https://neon.tech). After creating a database, you will need to set the `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING` environment variables in the `.env` file.

### Install dependencies

To install the dependencies, run the following command from the root of the monorepo:

```sh
pnpm install
```

### Build and Run

Run the following command:

```sh
pnpm build

# For the server
cd apps/api && pnpm start

# For the client
cd apps/web && pnpm dev
```

## What's inside?

Since its a turborepo it includes the following packages/apps:

### Apps and Packages

- `web`: A [Next.js](https://nextjs.org/) frontend.
- `api`: A [Fastify](https://www.fastify.io/) API to handle uploading to the server.
- `@repo/util`: Contains some error utilities.
- `@repo/types`: Contains shared types.
- `@repo/eslint-config`: `eslint` configurations
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Build

To build all apps and packages, run the following command:

```
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
pnpm dlx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
pnpm dlx turbo link
```

# DISCLAIMER
This project is meant for educational purposes only. I did it for my A-Level Computer Science NEA. I am not responsible for any misuse of this project. Please do not use it for illegal purposes. I am not responsible for any bans or suspensions from Discord or Telegram. Use at your own risk.
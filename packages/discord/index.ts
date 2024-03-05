import { Client } from "./src/client";

const client = new Client('NzM1MTA3NDc0OTY0ODczMzM3.G-lfWQ.PEqb3KJ0XpZPiGkXIiQm7CD-eyax28wKDXi790')

client.uploadAsText({ channelId: '949673655250599959', filePath: "C:\\Users\\Mohit\\Downloads\\postgresql-16.2-1-windows-x64.exe" })

export {
    client
}
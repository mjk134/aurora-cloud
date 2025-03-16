import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "../../../../lib/session";
import database from "../../../../lib/database";
import { DownloadDataUnion } from "@repo/types";
import { fetch, Agent } from 'undici'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> },
) {
  const { fileId } = await params;

  if (!fileId) {
    return NextResponse.json({
      success: false,
      message: "An error occured while downloading the file.",
      error: "Please include file as param.",
    });
  }

  const user = await getUserFromSession();

  if (!user) {
    return NextResponse.json({
      success: false,
      message: "An error occured while downloading the file.",
      error: "User not found.",
    });
  }

  // check if file exists with the user
  // if not, return error
  const dbFile = await database.file.findFirst({
    where: {
      file_id: fileId,
      user_id: user.user_id,
    },
    include: {
      discord_storage: {
        orderBy: {
          chunk_index: "asc",
        },
      },
      telegram_storage: {
        orderBy: {
          chunk_index: "asc",
        },
      },
    },
  });

  if (!dbFile) {
    return NextResponse.json({
      success: false,
      message: "An error occured while downloading the file.",
      error: "File not found in database.",
    });
  }

  let data: DownloadDataUnion | undefined;

  // Check location of file using dbFile by check its relation with DiscordStorage/TelegramStorage
  if (dbFile.discord_storage.length > 0) {
    // proccess discord request
    data = {
      chunks: dbFile.discord_storage.map((chunk) => {
        return {
          channel_id: chunk.channel_id,
          message_id: chunk.message_id,
        };
      }),
      file_name: dbFile.file_name,
      encrypted: {
        key: Array.from(dbFile.key),
        iv: Array.from(dbFile.iv),
        authTag: Array.from(dbFile.auth_tag),
      },
      user_id: user.user_id,
      file_id: dbFile.file_id,
      file_length: BigInt(dbFile.file_size),
      type: "dc",
    };
  } else if (dbFile.telegram_storage.length > 0) {
    // process telegram request
    data = {
      chunks: dbFile.telegram_storage.map((chunk) => {
        return {
          file_id: chunk.tg_file_id,
        };
      }),
      encrypted: {
        key: Array.from(dbFile.key),
        iv: Array.from(dbFile.iv),
        authTag: Array.from(dbFile.auth_tag),
      },
      file_name: dbFile.file_name,
      user_id: user.user_id,
      file_id: dbFile.file_id,
      file_length: BigInt(dbFile.file_size),
      type: "tg",
    };
  }

  if (!data) {
    return NextResponse.json({
      success: false,
      message: "An error occured while downloading the file.",
      error: "File not found.",
    });
  }

  const replacer = (key: string, value: any) =>
    typeof value === "bigint" ? { $bigint: value.toString() } : value;

  const chunks = Buffer.from(JSON.stringify(data, replacer)).toString("base64");
  const res = await fetch(`http://localhost:3000/download?chunks=${chunks}`, {
    dispatcher: new Agent({
      keepAliveTimeout: 2147483647,
      keepAliveMaxTimeout: 2147483647,
      headersTimeout: 2147483647, // 32 bit signed integer max value
    })
  });
  const headers = new Headers(res.headers);
  headers.set("Content-Disposition", `filename=${dbFile.file_name};`);
  const stream = res.body as ReadableStream<Uint8Array>;

  // this is just to display the file in the browser, perhaps for user avatar
  // headers.set('Content-Type', dbFile.file_type);

  if (
    !res.body ||
    !res.headers.get("content-type") ||
    !res.headers.get("content-disposition")
  ) {
    return new NextResponse(null, { status: 404 });
  }

  // Takes 412904.13469999935 milliseconds to download a 2.3GB file
  return new NextResponse(stream, {
    status: 200,
    headers: headers,
    statusText: "OK",
  });
}

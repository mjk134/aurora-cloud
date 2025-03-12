import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "../../../../lib/session";
import database from "../../../../lib/database";
import { DiscordDownloadData, DownloadDataUnion } from "@repo/types";

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
  if (dbFile.discord_storage) {
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
      type: "dc",
    };
  } else if (dbFile.telegram_storage) {
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

  const chunks = Buffer.from(JSON.stringify(data)).toString("base64");
  const res = await fetch(`http://localhost:3000/download?chunks=${chunks}`);
  const blob = await res.blob();
  const headers = new Headers(res.headers);
  headers.set("Content-Disposition", `filename=${dbFile.file_name};`);

  // this is just to display the file in the browser
  // headers.set('Content-Type', dbFile.file_type);

  return new NextResponse(blob, { status: 200, statusText: "OK", headers });
}

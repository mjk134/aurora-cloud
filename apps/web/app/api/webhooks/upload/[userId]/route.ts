import { NextRequest, NextResponse } from "next/server";
import database from "../../../../../lib/database";
import { WebhookUploadActionUnion, WebsocketCompleteEvent } from "@repo/types";
import { revalidatePath } from "next/cache";


// Tokenate this so that this route cannot be exploited
export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const searchParams = req.nextUrl.searchParams
    // // Error handling
    // const err = searchParams.get('err') as 'true' | 'false' | null;

    // if (!err) {
    //     return NextResponse.json({
    //         success: false,
    //         message: "An error occured while uploading the file.",
    //         error: "No type found."
    //     })
    // }

    const body = await req.json();
    const file = body.file as {
        name: string,
        size: number,
        type: string
    };
    const data = body.data as WebhookUploadActionUnion;

    console.log('Data recieved on webhook: ', body)

    const user = await database.users.findFirst({
        where: {
            user_id: userId
        }
    })

    if (!user) {
        return NextResponse.json({
            success: false,
            message: "An error occured while uploading the file.",
            error: "User not found."
        })
    }

    const dbFile = await database.file.create({
        data: {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            user_id: user.user_id,
        }
    })   

    await database.parent.create({
        data: {
            file_id: dbFile.file_id,
            folder_id: '0', // TODO: Implement folders
            user_id: user.user_id
        }
    })
        
    switch (data.type) {
        case 'dc':
            // Should be typed as discord chunks
            const dcChunks = data.chunks;

            if (!dcChunks) {
                return NextResponse.json({
                    success: false,
                    message: "An error occured while uploading the file.",
                    error: "No chunks found."
                })
            }

            let index = 0;
            for (const chunk of dcChunks) {
                await database.discordStorage.create({
                    data: {
                        user_id: user.user_id,
                        file_id: dbFile.file_id,
                        channel_id: '949673655250599959',
                        chunk_index: index,
                        chunk_url: chunk.url,
                        message_id: chunk.message_id
                    }
                })
                index++;
            }
            break;
        case 'tg':
            const tgChunks = data.chunks;
            if (!tgChunks) {
                return NextResponse.json({
                    success: false,
                    message: "An error occured while uploading the file.",
                    error: "No chunks found."
                })
            }

            let tgIndex = 0;
            for (const c of tgChunks) {
                await database.telegramStorage.create({
                    data: {
                        user_id: user.user_id,
                        file_id: dbFile.file_id,
                        tg_file_id: c.file_id,
                        chunk_index: tgIndex                   
                    }
                })
                tgIndex++;
            }
            break;
    }


    // Revalidate path for the specific user
    revalidatePath('/home/files/0')

    return NextResponse.json({
        success: true,
        message: "File uploaded.",
        error: null
    })
}
import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, getVerfiedSession } from "../../../lib/session";
import { redirect } from "next/navigation";
import { UploadResponse } from "@repo/types";
import database from "../../../lib/database";

export async function POST(req: Request) {
    // Check if session is valid
    const user = await getUserFromSession()
    if (!user) {
        redirect('/login')
    }
    // Read form data from client
    const formData = await req.formData()
    const apiRequest = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    })
    // Parse response from api
    const apiResponse = await apiRequest.json() as UploadResponse;
    // Do db stuff here using user fetched using session
    const file = formData.get("file") as File;

    if (apiResponse.error) {
        return NextResponse.json({
            success: false,
            message: "An error occured while uploading the file.",
            error: apiResponse.error
        })
    }

    // Insert into file then sort out chunks
    const dbFile = await database.file.create({
        data: {
            file_name:file.name,
            file_size:file.size,
            file_type: file.type,
            user_id: user.user_id,
        }
    })   

    await database.parent.create({
        data: {
            file_id: dbFile.file_id,
            folder_id: '0',
            user_id: user.user_id
        }
    })

    for (const key in apiResponse) {
        
        switch (key) {
            case 'discord':
                const chunks = apiResponse.discord?.chunks;

                if (!chunks) {
                    return NextResponse.json({
                        success: false,
                        message: "An error occured while uploading the file.",
                        error: "No chunks found."
                    })
                }

                let index = 0;
                for (const chunk of chunks) {
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
            case 'telegram':
                // TODO: Add tg impl
                break;
        }
    }

    

    return NextResponse.json({
        success: true,
        message: "File uploaded.",
        error: null
    })
}
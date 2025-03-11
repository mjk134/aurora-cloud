import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, getVerfiedSession } from "../../../lib/session";
import { redirect } from "next/navigation";
import { UploadResponse } from "@repo/types";
import database from "../../../lib/database";

export async function POST(req: NextRequest) {
    // Check if session is valid
    const user = await getUserFromSession()
    if (!user) {
        return NextResponse.json({
            success: false,
            message: "An error occured while uploading the file.",
            error: "User not found."
        })
    }

    // Read query params
    const searchParams = req.nextUrl.searchParams
    const folderId = searchParams.get('folderId')

    if (!folderId) {
        return NextResponse.json({
            success: false,
            message: "An error occured while uploading the file.",
            error: "Folder not found."
        })
    }

    // Read form data from client
    const formData = await req.formData()
    // Don't make this blocking.
    const apiRequest = await fetch(`http://localhost:3000/upload?userId=${user.user_id}&folderId=${folderId}`, {
        method: 'POST',
        body: formData
    })

    // Parse response from api
    const apiResponse = await apiRequest.json() as UploadResponse;


    // Check if there was an error
    if (apiResponse.error) {
        console.log(apiResponse)
        return NextResponse.json({
            success: false,
            message: "An error occured while uploading the file.",
            error: apiResponse.error
        })
    }

    // Return success response
    return NextResponse.json({
        success: true,
        message: "File uploaded.",
        error: null
    })
}
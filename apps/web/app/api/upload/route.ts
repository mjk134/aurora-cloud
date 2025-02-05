import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession, getVerfiedSession } from "../../../lib/session";
import { redirect } from "next/navigation";
import { UploadResponse } from "@repo/types";

export async function POST(req: Request, res: Response) {
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

    return NextResponse.json({
        success: true,
        message: "File uploaded.",
        error: null
    })
}
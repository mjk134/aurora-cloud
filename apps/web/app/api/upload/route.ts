import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "../../../lib/session";
import { UploadResponse } from "@repo/types";

export async function POST(req: NextRequest) {
  // Check if session is valid
  const user = await getUserFromSession();
  if (!user) {
    return NextResponse.json({
      success: false,
      message: "An error occured while uploading the file.",
      error: "User not found.",
    }, { status: 401 });
  }

  // Read query params
  const searchParams = req.nextUrl.searchParams;
  const folderId = searchParams.get("folderId");
  const tempFileId = searchParams.get("tempFileId");

  if (!folderId) {
    return NextResponse.json({
      success: false,
      message: "An error occured while uploading the file.",
      error: "Folder not found.",
    }, { status: 404 });
  }

  // Read form data from client
  const formData = await req.formData();
  // Don't make this blocking.
  const apiRequest = await fetch(
    `http://localhost:3000/upload?userId=${user.user_id}&folderId=${folderId}&tempFileId=${tempFileId}`,
    {
      method: "POST",
      body: formData,
    },
  );

  // Parse response from api
  const apiResponse = (await apiRequest.json()) as UploadResponse;

  // Check if there was an error
  if (apiResponse.error) {
    console.log(apiResponse);
    return NextResponse.json({
      success: false,
      message: "An error occured while uploading the file.",
      error: apiResponse.error,
    }, { status: 500 });
  }

  // Return success response
  return NextResponse.json({
    success: true,
    message: "File uploaded to fastify.",
    error: null,
  });
}

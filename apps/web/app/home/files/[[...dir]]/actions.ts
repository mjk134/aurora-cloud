'use server'

import { getUserFromSession } from "../../../../lib/session"

export async function createFolder(name: string, folderId: string) {
    // Create db entry for folder
    const user = await getUserFromSession();

}
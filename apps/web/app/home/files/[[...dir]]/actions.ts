'use server'

import { revalidatePath } from "next/cache";
import { getUserFromSession } from "../../../../lib/session"

export async function createFolder(name: string, folderId: string) {
    // Create db entry for folder
    const user = await getUserFromSession();
}

export async function revalidateFiles(pathname: string) {             
    revalidatePath('/home/files', 'page')
    revalidatePath(pathname)
    // redirect(pathname)
}
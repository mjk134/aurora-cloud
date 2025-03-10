'use server'

import { revalidatePath } from "next/cache";
import { getUserFromSession } from "../../../../lib/session"
import database from "../../../../lib/database";

export async function createFolder(name: string, parentFolderId: string) {
    // Create db entry for folder
    const user = await getUserFromSession();
}

export async function revalidateFiles(pathname: string) {             
    revalidatePath('/home/files', 'page')
    revalidatePath(pathname)
    // redirect(pathname)
}

/**
 * Delete a file from the database and storage.
 * @param file The file to delete
 * @param pathname The pathname of the file location in terms of folders
 */
export async function deleteFile(fileId: string, pathname: string) {
    const user = await getUserFromSession();

    if (!user) return;

    const dbFile = await database.file.findFirst({
        where: {
            file_id: fileId,
            user_id: user?.user_id
        },
        include: {
            parents: true,
            discord_storage: true,
            telegram_storage: true
        }
    });

    if (!dbFile) return;

    if (dbFile.discord_storage) {
        // purge discord storage entries
        await database.discordStorage.deleteMany({
            where: {
                chunk_id: {
                    in: dbFile.discord_storage.map((storage) => storage.chunk_id)
                }
            }
        })
    } else if (dbFile.telegram_storage) {
        // purge telegram storage entries
        await database.telegramStorage.deleteMany({
            where: {
                chunk_id: {
                    in: dbFile.telegram_storage.map((storage) => storage.chunk_id)
                }
            }
        })
    }

    // Delete parent entry
    if (dbFile.parents) {
        await database.parent.deleteMany({
            where: {
                file_id: fileId,
                user_id: user.user_id,
            }
        })
    }

    // Delete file entry
    await database.file.delete({
        where: {
            file_id: fileId,
            user_id: user.user_id
        }
    })

    revalidatePath(pathname) // revalidate folder path

}
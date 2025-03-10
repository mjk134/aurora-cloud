import { cookies } from "next/headers"
import Input from "../../../../components/ui/input"
import FileDropzone from "../../../../components/file-dropzone"
import FileUpload from "../../../../components/modals/file-upload"
import { getUserFromSession } from "../../../../lib/session"
import database from '../../../../lib/database'
import { FileBox, FolderBox } from "./components"
import { redirect } from "next/navigation"
import { revalidatePath, revalidateTag } from "next/cache"
import { revalidateFiles } from "./actions"
import Button from "../../../../components/ui/button"
import { Plus } from "lucide-react"

// root param means folder id = 0
export default async function Files({
    params
}: {
    params: Promise<{ dir: string[] }>,
}) {
    // Last item in param array is the folder id
    const asyncParams = await params;

    // If no folder id, redirect to root folder
    if (!asyncParams.dir) {
        redirect('/home/files/0')
    } else if (asyncParams.dir.length === 0) {
        redirect('/home/files/0')
    }

    // Get the folder id
    const folderId = asyncParams.dir[asyncParams.dir.length - 1];


    // Fetch all files and folders in root folder id: 0
    const user = await getUserFromSession()

    if (!user) {
        redirect('/login')
    }

    const folderFileIds = await database.parent.findMany({
        where: {
            user_id: user?.user_id,
            folder_id: asyncParams.dir.length === 1 ? '0' : folderId,
        }
    })

    // If no files or folders in root folder, return empty
    // if (folderFileIds.length === 0) {
    //     console.log(folderFileIds)
    //     redirect('/home/files/0')
    // }

    // Query file table to see what files are in the root folder
    const files = await database.file.findMany({
        where: {
            file_id: {
                in: folderFileIds.map((folder) => folder.file_id)
            },
            user_id: user?.user_id
        }
    })

    // Query folder table to see what folders are in the root folder
    const folders = await database.folder.findMany({
        where: {
            folder_id: {
                in: folderFileIds.map((folder) => folder.folder_id)
            },
            user_id: user?.user_id,
        }
    })


    return (
        <div className="flex relative font-sans flex-col p-5 h-screen w-full">
            <h1 className="text-4xl font-bold">All Files</h1>
            <p className="text-lg">The best place to upload and manage your files.</p>
            <Input placeholder="Search files" />
            <div className="flex relative flex-col h-full w-full overflow-hidden">
                <div className="text-lg font-bold mt-3 pb-4">Home</div>
                <FileDropzone userId={user?.user_id} revalidatePath={revalidateFiles} className="grid grid-cols-5 grid-rows-auto gap-4 overflow-scroll pb-32" files={files} folders={folders.filter((folder) => folder.folder_id !== '0')}/>
                <Button className="absolute right-5 bottom-0 w-[140px] h-20 font-light text-xl gap-2 px-2"> <Plus />New Item</Button>
            </div>
        </div>
    )
}
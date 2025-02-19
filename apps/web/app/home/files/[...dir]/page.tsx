import { cookies } from "next/headers"
import Input from "../../../../components/ui/input"
import FileDropzone from "../../../../components/file-dropzone"
import FileUpload from "../../../../components/modals/file-upload"
import { getUserFromSession } from "../../../../lib/session"
import database from '../../../../lib/database'
import { FileBox, FolderBox } from "./components"

// root param means folder id = 0
export default async function Files({
    params
}: {
    params: Promise<{ dir: string[] }>,
}) {
    // Last item in param array is the folder id
    const syncParams = await params;
    const folderId = syncParams.dir[syncParams.dir.length - 1];


    // Fetch all files and folders in root folder id: 0
    const user = await getUserFromSession()
    const folderFileIds = await database.parent.findMany({
        where: {
            user_id: user?.user_id,
            folder_id: syncParams.dir.length === 1 ? '0' : folderId,
        }
    })

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
            <FileDropzone className="grid grid-cols-4 gap-4 mt-5">
                <div className="text-lg font-bold">Wowowoo</div>
                {folders.map((folder) => <FolderBox key={folder.folder_id} folder={folder} />)}
                {files.map((file) => <FileBox key={file.file_id} file={file} />)}
            </FileDropzone>
        </div>
    )
}
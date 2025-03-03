'use client'

import { File, Folder } from "@prisma/client"
import { FileIcon } from "lucide-react"

export function FileBox({ file }: { file: File }) {

    return (
        <div className="flex justify-center items-center border border-solid border-gray-600 rounded-lg">
            <FileIcon />
            {file.file_name}.{file.file_type}
        </div>
    )
}

export function FolderBox({ folder }: { folder: Folder }) {

    return (
        <div className="flex justify-center items-center border border-solid border-gray-600 rounded-lg">
            <FileIcon />
            {folder.name}
        </div>
    )
}
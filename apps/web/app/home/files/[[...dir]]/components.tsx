'use client'

import { File, Folder } from "@prisma/client"
import { FileIcon, FileImage, FileMusic, FileText, FileVideo } from "lucide-react"
import useContextMenu from "../../../../hooks/useContextMenu"
import { cn } from "../../../../lib/style"
import Button from "../../../../components/ui/button"
import React from "react"

export function FileBox({ file, children, ...props }: { file: File, children?: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {

    function getFileIcon() {
        if (file.file_type.includes('image')) {
            return <FileImage size={64} strokeWidth={1} />
        } 
        if (file.file_type.includes('pdf')) {
            return <FileText size={64} strokeWidth={1} />
        } 
        // if (file.file_type.includes('video')) {
        //     <FileVideo size={64} strokeWidth={1} />
        // }
        // if (file.file_type.includes('audio')) {
        //     <FileMusic size={64} strokeWidth={1} />
        // }
        else {
            return <FileIcon size={64} strokeWidth={1} />
        }
    }

    return (
        <div className="flex relative flex-col gap-1 h-[200px] w-[200px] md-h-[240px] md-w-[240px] justify-center text-center p-2 items-center border border-solid font-light text-sm border-gray-600 rounded-lg" {...props}>
            {getFileIcon()}
            {file.file_name.length > 150 ? file.file_name.slice(0, 150) + "..." : file.file_name}
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
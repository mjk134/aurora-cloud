'use client'

import { useEffect, useState } from "react"
import { cn } from "../lib/style"
import { WebsocketEventUnion } from "@repo/types"
import { usePathname } from "next/navigation"
import Button from "./ui/button"
import { File, Folder } from "@prisma/client"
import { FileBox, FolderBox } from "../app/home/files/[[...dir]]/components"
import useContextMenu from "../hooks/useContextMenu"


export default function FileDropzone({ files, folders, className, userId, deleteFile, currentFolderId }: { folders: Folder[], files: File[], className?: string, userId: string, deleteFile: (fileId: string, path: string) => Promise<void>; currentFolderId: string }) {
    const [showInput, setShowInput] = useState(false);
    const [dragging, setDragging] = useState(false);
    const pathname = usePathname();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pendingFiles, setFiles] = useState<{
        fileId: string;
        progress: number; // Percentage,
        chunks: number | null;
        status: 'uploading' | 'processing' | 'completed' | 'downloading';
    }[]>([])

    useEffect(() => {
        const websocket = new WebSocket("ws://localhost:3001/api/socket")
        websocket.onopen = () => {
            console.log('[Client Socket] Connected to websocket server')
            websocket.send(Buffer.from(JSON.stringify({ user_id: userId }), 'utf-8').toString('base64'))
        }
        websocket.onmessage = (message) => {
            const data = JSON.parse(Buffer.from(JSON.parse(message.data).data, 'base64').toString('utf-8')) as WebsocketEventUnion | undefined;
            if (!data) return;

            switch (data.event) {
                case 'init':
                    break;
                case 'chunk':
                    break;
                case 'complete': 
                    console.log('[Client Socket] Finished uploading file with id:', data.fileId)
                    break;
            }
        }
        websocket.onclose = () => {
            console.log('[Client Socket] Disconnected from websocket server')
        }

        setSocket(websocket)
        
        return () => {
            websocket?.close()
        }
    }, [])

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(true)
        setShowInput(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        setShowInput(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        setShowInput(false)
        // Handle the file drop here
        const files = e.dataTransfer.files

        // Maybe promise.all this??
        for (const file of files) {
            const formData = new FormData()
            formData.append("file", file)
            await fetch("/api/upload?folderId=" + currentFolderId, {
                method: "POST",
                body: formData
            })

        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }


    return (
        <div
            className={cn("w-full h-full relative", className)}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {folders.map((folder) => 
                <FolderBox 
                    key={folder.folder_id} 
                    folder={folder} 
                />
            )}
            {files.map((file) => 
                <FileBox 
                    key={file.file_id} 
                    file={file}  
                    deleteFile={deleteFile}                  
                />
            )}
        </div>
    )
}
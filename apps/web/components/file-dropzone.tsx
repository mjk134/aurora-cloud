'use client'

import { useEffect, useState } from "react"
import { cn } from "../lib/style"
import { WebsocketEventUnion } from "@repo/types"
import { usePathname } from "next/navigation"

const ContextMenu = ({ position, toggled }: { position: { x: number, y: number }, toggled: boolean }) => {
    return (
        <menu className={cn("absolute", toggled ? "block" : "hidden")} style={{ top: position.y + 2, left: position.x + 2 }}>
            <li>
                <button id="save">Create Folder</button>
            </li>
        </menu>
    )
}

export default function FileDropzone({ children, className, userId, revalidatePath }: { children?: React.ReactNode, className?: string, userId: string, revalidatePath: (path: string) => Promise<void> }) {
    const [showInput, setShowInput] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [contextMenu, setContextMenu] = useState({
        position: {
            x: 0,
            y: 0
        },
        toggled: false
    });
    const pathname = usePathname();
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [files, setFiles] = useState<{
        fileId: string;
        progress: number; // Percentage,
        chunks: number | null;
        status: 'uploading' | 'processing' | 'completed' | 'downloading';
    }[]>([])

    useEffect(() => {
        const websocket = new WebSocket("ws://localhost:3001/api/socket")
        websocket.onopen = () => {
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
                    console.log('Finished uploading file with id:', data.fileId)
                    revalidatePath(pathname) // TODO: fix revalidation
                    break;
            }

        }
        setSocket(websocket)
        
        return () => {
            socket?.close()
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
            await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

        }
    }

    // context menu handler
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setContextMenu({
            position: {
                x: e.nativeEvent.offsetX,
                y: e.nativeEvent.offsetY
            },
            toggled: true
        })
    }

    return (
        <div
            className={cn("w-full h-full relative", className)}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => {
                e.preventDefault()
            }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onContextMenu={handleContextMenu}
            onMouseDown={() => {
                setContextMenu({
                    ...contextMenu,
                    toggled: false
                })
            }}
        >
            <ContextMenu {...contextMenu} />
            {children}
        </div>
    )
}
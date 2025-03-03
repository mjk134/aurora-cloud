'use client'

import { useState } from "react"
import { cn } from "../lib/style"


const ContextMenu = ({ position, toggled }: { position: { x: number, y: number }, toggled: boolean }) => {


    return (<menu className={cn("absolute", toggled ? "block" : "hidden")} style={{ top: position.y, left: position.x }}>
    <li><button id="save">Save for later</button></li>
    <li><button id="share">Share this news</button></li>
    </menu>)
}


export default function FileDropzone({ children, className }: { children?: React.ReactNode , className?: string }) {
    const [showInput, setShowInput] = useState(false)
    const [dragging, setDragging] = useState(false)
    const [contextMenu, setContextMenu] = useState({
        position: {
            x: 0,
            y: 0
        },
        toggled: false
    })

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

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragging(false)
        setShowInput(false)
        // Handle the file drop here
        const files = e.dataTransfer.files
        console.log(files)
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
                console.log('drag over')
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
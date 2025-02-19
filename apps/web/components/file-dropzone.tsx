'use client'

import { useState } from "react"
import { cn } from "../lib/style"

export default function FileDropzone({ children, className }: { children?: React.ReactNode , className?: string }) {
    const [showInput, setShowInput] = useState(false)
    const [dragging, setDragging] = useState(false)

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

    return (
        <div
            className={cn("w-full h-full", className)}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => {
                e.preventDefault()
                console.log('drag over')
            }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {children}
        </div>
    )
}
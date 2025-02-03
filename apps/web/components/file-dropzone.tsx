'use client'

import { useState } from "react"

export default function FileDropzone() {
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
            className={`w-screen h-screen top-0 left-0 absolute ${dragging ? 'pointer-events-auto' : 'pointer-events-none'}`}
            onDragEnter={handleDragEnter}
            onDragOver={(e) => {
                e.preventDefault()
                console.log('drag over')
            }}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {showInput && (
                <input
                    type="file"
                    className="w-full h-full opacity-0 absolute top-0 left-0"
                />
            )}
        </div>
    )
}
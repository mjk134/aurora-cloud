'use client'

import { Plus, Upload } from "lucide-react";
import Button from "../ui/button";
import { useRef, useState } from "react";

export default function FileUpload() {
    const [files, setFiles] = useState<File[]>([])


    const onFileDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const files = e.dataTransfer.files
        setFiles((prevFiles) => [...prevFiles, ...Array.from(files)])
    }

    const uploadFiles = async () => {
        // const formData = new FormData()
        // files.forEach((file) => {
        //     formData.append("files", file)
        // })

        // const res = await fetch("/api/upload", {
        //     method: "POST",
        //     body: formData
        // })

        // if (res.ok) {
        //     setFiles([])
        // }

        // Upload each file 1 by 1
        for (const file of files) {
            const formData = new FormData()
            formData.append("file", file)
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            })

            if (res.ok) {
                setFiles((prevFiles) => prevFiles.filter((f) => f !== file))
            } else {
                // Proccess sonner toast here
            }
        }
    }
    
    return (
        <>
            <div onDrop={onFileDrop} onDragOver={(e) => e.preventDefault()} className="border-dashed rounded-md border-2 flex justify-center items-center border-blue-300 w-full h-full">
                {files.length === 0 ? (<div>📂 Drag files here</div>) : (
                    <div className="flex flex-col gap-2">
                        <div className="text-lg font-medium">Uploading these files</div>
                        {files.map((file) => (
                            <div key={file.name} className="flex justify-between border-solid border-gray-300 border p-2 rounded-md gap-4 items-center w-full">
                                <div className="flex  gap-2 items-center">
                                    <p>{file.name}</p>
                                </div>
                                <Button variant="danger" onClick={() => {
                                    setFiles((prevFiles) => prevFiles.filter((f) => f !== file))
                                }}>Remove</Button>
                            </div>
                        ))}
                    </div>
                )}

            </div>
            <Button disabled={files.length === 0} className="gap-2 flex">Upload<Upload size={14} /></Button>
        </>
    )
}
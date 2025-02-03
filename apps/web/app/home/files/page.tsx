import { cookies } from "next/headers"
import Input from "../../../components/ui/input"
import FileDropzone from "../../../components/file-dropzone"
import FileUpload from "../../../components/modals/file-upload"

export default async function Home() {
    return (
        <div className="flex relative font-sans flex-col p-5 h-screen w-full">
            <FileUpload />
            <h1 className="text-4xl font-bold">All Files</h1>
            <p className="text-lg">The best place to upload and manage your files.</p>
            <Input placeholder="Search files" />
        </div>
    )
}
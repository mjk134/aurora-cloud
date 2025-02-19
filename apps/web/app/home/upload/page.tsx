
import { cookies } from "next/headers"
import Input from "../../../components/ui/input"
import FileDropzone from "../../../components/file-dropzone"
import FileUpload from "../../../components/modals/file-upload"

export default async function UploadFiles() {



    return (
        <div className="flex relative font-sans flex-col p-5 h-screen w-full">
            <h1 className="text-4xl font-bold">File upload</h1>
            <p className="text-lg">Drag your files into the box below to upload them! These files will be uploaded to the root folder.</p>
            <FileUpload />
        </div>
    )
}
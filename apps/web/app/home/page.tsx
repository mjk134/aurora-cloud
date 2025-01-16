import { cookies } from "next/headers"
import TestForm from "../components"

export default async function Home() {
    return (
        <div className="flex font-sans flex-col items-center justify-center h-screen w-full">
            <h1 className="text-4xl font-bold">Welcome to Aurora Cloud</h1>
            <p className="text-lg mt-4">The best place to upload and manage your files.</p>
            <TestForm />
        </div>
    )
}
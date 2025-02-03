import { Plus } from "lucide-react";
import Button from "../ui/button";

export default function FileUpload() {
    
    return (
        <div className="w-full p-10 h-screen top-0 left-0 absolute flex justify-end items-end">
            <Button className="w-18 h-18">
                <Plus size={32} />
            </Button>
        </div>
    )
}
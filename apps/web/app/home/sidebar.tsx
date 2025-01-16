'use client'

import { Users } from "@prisma/client";
import Button from "../../components/ui/button";
import { usePathname } from "next/navigation";

export default function Sidebar( { user, logout } : {
    user: Users;
    logout: () => void;
}) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col w-[20vw] rounded-r-lg border justify-between border-r-slate-100 p-5">
            <div className="flex w-full flex-col">
                <div>Logo</div>
                <h1 className="font-semibold">Main</h1>
                <div className="flex w-full flex-col">
                    <Button>Dashboard</Button>
                    <Button variant="unselected">All files</Button>
                    <Button variant="unselected">Settings</Button>
                    <Button variant="unselected">Analysis</Button>
                </div>
                <h1 className="font-semibold">Recent Folders</h1>
            </div>
            <div className="flex p-2 justify-between">
                <div className="flex gap-2">
                    <div className="w-6 rounded-full h-6 bg-red-600"></div>
                    <p>{user.username}</p>
                </div>
            </div>
        </div>
    )
}
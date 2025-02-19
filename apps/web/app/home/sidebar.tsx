'use client'

import { Users } from "@prisma/client";
import Button from "../../components/ui/button";
import { redirect, usePathname } from "next/navigation";
import { ChartPie, Cog, DoorOpen, Files, House, Upload, UserRoundCog } from "lucide-react";
import Link from "next/link";

type Route = {
    name: string;
    icon: JSX.Element;
    route: string;
    isSlug: boolean;
}

// Declared outside component to avoid re-creating the array on each render
const routes: Route[] = [
    {
        name: "Dashboard",
        icon: <House size={24} />,
        route: "/home",
        isSlug: false
    },
    {
        name: "All files",
        icon: <Files size={24} />,
        route: "/home/files",
        isSlug: true,
    },
    {
        name: "Upload",
        icon: <Upload size={24} />,
        route: "/home/upload",
        isSlug: false,
    },
    {
        name: "Settings",
        icon: <Cog size={24} />,
        route: "/home/settings",
        isSlug: false,
    },
    {
        name: "Analysis",
        icon: <ChartPie size={24} />,
        route: "/home/analytics",
        isSlug: false,
    }
]

function verifyRoute(route: Route, pathname: string): "primary" | "unselected" {
    if (route.isSlug) {
        if (pathname.includes(route.route)) {
            return "primary"
        } else {
            return "unselected"
        }
    } else {
        if (pathname === route.route) {
            return "primary"
        } else {
            return "unselected"
        }
    }

}

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
                <div className="flex w-full flex-col gap-3 pb-5">
                    {routes.map((route) => (
                        <Button
                            key={route.name}
                            className="justify-start items-center text-start gap-2 font-medium text-lg leading-4"
                            variant={verifyRoute(route, pathname)}
                            onClick={() => redirect(route.route)}
                        >
                            {route.icon} {route.name}
                        </Button>
                    ))}
                </div>
                <h1 className="font-semibold">Recent Folders</h1>
            </div>
            <div className="flex flex-row p-2 justify-between">
                <div className="flex gap-2">
                    <div className="w-6 rounded-full h-6 bg-red-600"></div>
                    <p>{user.username}</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => { redirect("/home/settings") }} variant="unselected" className="m-0 p-0">
                        <UserRoundCog />
                    </Button>
                    <Button onClick={() => { logout(); }} variant="unselected" className="m-0 p-0">
                        <DoorOpen />
                    </Button>
                </div>
            </div>
        </div>
    )
}
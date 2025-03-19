"use client";

import { Users } from "@prisma/client";
import Button from "../../components/ui/button";
import { redirect, usePathname } from "next/navigation";
import {
  ChartPie,
  CircleUserRound,
  Cog,
  DoorOpen,
  Files,
  Folder,
  House,
  Search,
  UserRoundCog,
} from "lucide-react";
import Image from "next/image";
import { getTypedStorageItem } from "../../lib/local";

type Route = {
  name: string;
  icon: JSX.Element;
  route: string;
  isSlug: boolean;
};

function verifyRoute(route: Route, pathname: string): "primary" | "unselected" {
  if (route.isSlug) {
    if (pathname.includes(route.route)) {
      return "primary";
    } else {
      return "unselected";
    }
  } else {
    if (pathname === route.route) {
      return "primary";
    } else {
      return "unselected";
    }
  }
}

export default function Sidebar({
  user,
  logout,
  rootFolderId,
}: {
  user: Users;
  logout: () => void;
  rootFolderId: string;
}) {
  const pathname = usePathname();
  const folders = getTypedStorageItem("recentFolders");
  const routes: Route[] = [
    {
      name: "Dashboard",
      icon: <House size={24} />,
      route: "/home",
      isSlug: false,
    },
    {
      name: "All files",
      icon: <Files size={24} />,
      route: `/home/files/${rootFolderId}`,
      isSlug: true,
    },
    {
      name: "Search",
      icon: <Search size={24} />,
      route: "/home/search",
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
    },
  ];

  return (
    <div className="flex flex-col w-[20vw] rounded-r-lg border justify-between border-r-slate-100 p-5">
      <div className="flex w-full flex-col">
        <Image
          alt="logo"
          src="/logo.svg"
          width={300}
          height={300}
          // className="absolute top-0 left-0 -z-20 object-cover"
        />

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
        <div className="flex w-full flex-col gap-3 pb-5">
          {folders?.map((folder) => (
            <Button
              key={folder.folderId}
              className="justify-start items-center text-start gap-2 font-medium text-lg leading-4"
              variant="unselected"
              onClick={() => redirect(folder.folderPath)}
            >
              <Folder size={24} /> {folder.folderName}
            </Button>
          ))}
          {folders?.length === 0 && (
            <p className="text-gray-200 text-md">No recent folders</p>
          )}
        </div>
      </div>
      <div className="flex flex-row p-2 justify-between">
        <div className="flex gap-2 items-center">
          <CircleUserRound stroke="grey" strokeWidth={1.4} size={28} />
          <p>{user.username}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              redirect("/home/settings");
            }}
            variant="unselected"
            className="m-0 p-0"
          >
            <UserRoundCog />
          </Button>
          <Button
            onClick={() => {
              logout();
            }}
            variant="unselected"
            className="m-0 p-0"
          >
            <DoorOpen />
          </Button>
        </div>
      </div>
    </div>
  );
}

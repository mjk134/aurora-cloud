import { getUserFromSession } from "../../lib/session";
import Sidebar from "./sidebar";
import { redirect } from "next/navigation";
import { logout } from "./actions";
import database from "../../lib/database";

export default async function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromSession();

  if (!user) redirect("/login");

  // Sidebar is a client component so we need to pass the folder object to it
  const rootFolder = await database.folder.findFirst({
    where: {
      user_id: user.user_id,
      is_root: true,
    },
  });

  if (!rootFolder) {
    console.log("Root folder not found for user", user);
    return redirect('/_not-found'); // or some error page
  }

  return (
    <main className="flex md:flex-row font-sans relative flex-col min-h-screen w-full">
      {/* Shared across all pages in this directory */}
      <Sidebar user={user} logout={logout} rootFolderId={rootFolder?.folder_id} />
      {children}
    </main>
  );
}
import { getUserFromSession } from "../../lib/session";
import { Suspense } from "react";
import Loading from "./loading";
import Sidebar from "./sidebar";
import { redirect } from "next/navigation";
import { logout } from "./actions";

export default async function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  const user = await getUserFromSession();

  if (!user) redirect("/login");
  return (
    <main className="flex md:flex-row font-sans relative flex-col min-h-screen w-full">
      {/* Include shared UI here e.g. a header or sidebar */}
      <Sidebar user={user} logout={logout} />
      {children}
    </main>
  );
}

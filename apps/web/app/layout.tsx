import "./globals.css";
import { League_Spartan } from "next/font/google";
import { Toaster } from "sonner";
import type { JSX } from "react";

const league_spartan = League_Spartan({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-league-spartan",
});

export const metadata = {
  title: "Aurora Cloud",
  description: "A cloud storage service.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body className={`${league_spartan.variable}`}>
        <Toaster position="bottom-center" offset={24} />
        {children}
      </body>
    </html>
  );
}

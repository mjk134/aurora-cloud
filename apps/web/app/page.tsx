"use client";

import { motion } from "motion/react";
import GradientBackground from "../components/gradient-background";
import Button from "../components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <main className="flex font-sans flex-col p-6 relative min-h-screen w-full overflow-hidden">
      <GradientBackground />
      <nav className="flex p-10 items-center justify-between">
        <motion.div
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex gap-2 text-center justify-center items-center"
        >
          <Image
            alt="logo"
            src="/logo.svg"
            width={300}
            height={300}
            className="invert"
          />
        </motion.div>
      </nav>
      <div className="flex text-white items-center justify-center h-full p-4 pt-8">
        <div className="flex flex-col md:w-[70%] gap-1 px-2 md:px-0">
          <motion.div
            initial={{ y: -200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-5xl md:text-8xl font-bold  font-heading opacity-0 pt-[100px] md:pt-[180px]"
          >
            Upload files for free. <br></br>No hidden fees.
          </motion.div>
          <motion.div
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex gap-2 pt-3"
          >
            <Link href="/signup">
              <Button
                variant="primary"
                className="text-lg md:text-2xl font-bold p-6 md:p-8 bg-white text-[#0891B2]"
              >
                Get Started
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

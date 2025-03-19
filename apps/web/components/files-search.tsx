"use client";

import { useEffect, useRef, useState } from "react";
import Input from "./ui/input";
import { SearchIcon } from "lucide-react";
import { cn } from "../lib/style";
import { redirect, usePathname } from "next/navigation";

export default function SearchFiles({
  initalSearch = "",
  disabled = false,
}: {
  initalSearch?: string;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState(initalSearch);

  const handler = (e: KeyboardEvent) => {
    if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
      console.log("Focus search");
      setFocused(true);
      inputRef.current?.focus();
    }
  };

  const handleEnter = () => {
    // Proccess search
    redirect(`/home/search?q=${encodeURIComponent(search)}`);
  };

  useEffect(() => {
    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <Input
      asChild
      className={cn(
        "w-full py-4 text-xl relative gap-4 bg-transparent",
        focused && "ring ring-blue-400 border-white",
      )}
      disabled={disabled}
    >
      <SearchIcon />
      <div className="w-full relative">
        <span
          className={cn(
            "text-black text-opacity-25 absolute left-0 -z-10",
            search.length !== 0 && "hidden",
          )}
        >
          Search files, or use{" "}
          <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            Ctrl
          </kbd>{" "}
          +{" "}
          <kbd className="px-2 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">
            S
          </kbd>
        </span>
        <input
          ref={inputRef}
          onFocus={() => {
            setFocused(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEnter();
            }
          }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
          }}
          onBlur={() => {
            setFocused(false);
          }}
          className="w-full focus:border-0 focus:outline-none bg-transparent"
          type="search"
        />
      </div>
    </Input>
  );
}

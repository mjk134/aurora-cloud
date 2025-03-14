"use client";

import { useEffect, useRef, useState } from "react";
import Input from "./ui/input";
import { SearchIcon } from "lucide-react";
import { cn } from "../lib/style";

export default function SearchFiles() {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");

  const handler = (e: KeyboardEvent) => {
    if (e.key === "s" && e.ctrlKey) {
      e.preventDefault();
      console.log("Focus search");
      setFocused(true);
      inputRef.current?.focus();
    }
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
        "w-full relative gap-4 bg-transparent",
        focused && "ring ring-blue-400",
      )}
    >
      <SearchIcon />
      <div className="w-full relative">
        <span
          className={cn(
            "text-black text-opacity-25 absolute left-0 -z-10",
            (focused || search.length !== 0) && "hidden",
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

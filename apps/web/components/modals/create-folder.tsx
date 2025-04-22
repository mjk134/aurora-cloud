'use client'

import { Plus, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import React, { useTransition } from "react";
import Button from "../ui/button";
import Input from "../ui/input";

export function CreateFolderModal({
    createFolder,
    currentFolderId,
  }: {
    createFolder: (
      name: string,
      parentFolderId: string,
      pathname: string,
    ) => Promise<void>;
    currentFolderId: string;
  }) {
    const [folderName, setFolderName] = React.useState("");
    const pathname = usePathname();
    const [error, setError] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [isPending, startTransition] = useTransition();
  
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
  
      // Can't be empty
      if (!folderName) {
        setError("Please enter a folder name.")
        return;
      }
      if (folderName.length > 50) {
        setError("Folder name must be less than 50 characters");
        return;
      }
      // From here create folder handles navigation, set pending so the user can't spam creations
      startTransition(() => {
        createFolder(folderName, currentFolderId, pathname);
      });
      setIsOpen(false);
    };
  
    return (
      <Dialog.Root open={isOpen}>
        <Dialog.Trigger asChild>
          <Button
            onClick={() => setIsOpen(true)}
            className="absolute right-5 bottom-0 w-[140px] h-20 font-light text-xl gap-2 px-2"
          >
            {" "}
            <Plus />
            New Folder
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-gray backdrop-blur-sm data-[state=open]:animate-overlayShow" />
          <Dialog.Content asChild>
            <form
              onSubmit={onSubmit}
              className="fixed border border-solid border-gray-100 bg-white font-sans left-1/2 top-1/2 max-h-[85vh] w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-gray1 p-[25px] shadow-[var(--shadow-6)] focus:outline-none data-[state=open]:animate-contentShow"
            >
              <Dialog.Title className="m-0 text-lg font-medium text-mauve12">
                Create a new folder
              </Dialog.Title>
              <Dialog.Description className="mb-5 mt-1 text-[15px] leading-normal text-mauve11">
                A new folder will be created in the current directory.
              </Dialog.Description>
              <fieldset className="mb-[15px] flex items-center gap-5">
                <label
                  className="text-right w-[150px] text-md font-medium"
                  htmlFor="name"
                >
                  Folder Name
                </label>
                <div className="w-full">
                  <Input
                    onChange={(e) => {
                      setFolderName(e.target.value);
                      setError("");
                    }}
                    value={folderName}
                    placeholder="A very cool folder name"
                    className="w-full text-md placeholder:text-md"
                  />
                  {/* Error message */}
                  <p className="text-xs text-red-400">{error.length !== 0 ? error : '‎'}</p>
                </div>
              </fieldset>
              <div className="mt-[20px] flex justify-end">
                <Button
                  className="px-10"
                  type="submit"
                  loading={isPending}
                >
                  Create
                </Button>
              </div>
              <Dialog.Close asChild>
                <button
                  className="absolute right-2.5 top-2.5 inline-flex size-[25px] appearance-none items-center justify-center rounded-full text-violet11 bg-gray3 hover:bg-violet4 focus:shadow-[0_0_0_2px] focus:shadow-violet7 focus:outline-none"
                  aria-label="Close"
                  onClick={() => setIsOpen(false)}
                >
                  <X />
                </button>
              </Dialog.Close>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
"use client";

import { toast } from "sonner";
import Button from "../../../components/ui/button";
import { deleteAccount, resetHome } from "./actions";
import { useEffect, useState, useTransition } from "react";

export default function SettingsPage() {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    toast.dismiss();
  }, [isPending]);

  return (
    <div className="flex relative font-sans flex-col p-5 h-screen w-full">
      <h1 className="text-5xl font-bold">Settings</h1>
      <p className="text-lg">View and change your settings.</p>
      <div className="grid grid-cols-2 gap-4 grid-rows-auto relative flex-col h-full w-full overflow-scroll">
        <div className="flex flex-col items-center">
          <div className="text-3xl font-medium mt-3 pb-4">Manage Account</div>
          <div className="w-full">
            <div className="flex flex-col gap-2 w-full">
              <div className="flex flex-row gap-2 items-center">
                <p className="text-2xl font-md">Terminate Account</p>
              </div>
              <div className="flex flex-col w-full">
                <p>
                  Are you sure you want to delete your account? This action{" "}
                  <b>cannot</b> be reversed.
                  <br /> Doing so will delete all of your files and folders. You
                  will also be redirected to login.
                </p>
                <Button
                  variant="danger"
                  loading={isPending}
                  onClick={async () => {
                    startTransition(async () => {
                      await deleteAccount();
                    });
                  }}
                  className="ml-auto font-semibold text-xl"
                >
                  Delete Account
                </Button>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <p className="text-2xl font-md">Clear files and folders</p>
              </div>
              <div className="flex flex-col w-full">
                <p>
                  Are you sure you want to delete your files and folders? This
                  action <b>cannot</b> be reversed.
                  <br /> Doing so will delete all of your files and folders.
                </p>
                <Button
                  variant="danger"
                  className="ml-auto font-semibold text-xl"
                  loading={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await resetHome();
                    });
                  }}
                >
                  Delete Files
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

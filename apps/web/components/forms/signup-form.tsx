"use client"

import { useActionState, useEffect } from "react";
import Input from "../ui/input";
import { FormAction, FormActionResponse } from "../../types";
import Button from "../ui/button";

export default function SignupForm({ serverAction }: {serverAction: FormAction<FormActionResponse | void>}) {
    const [state, action, pending] = useActionState(serverAction, {
        error: false,
        message: "",
        values: {
            username: "",
            password: ""
        }
    })

    return (
        <form action={action} className="flex gap-2 md:w-[35%] flex-col justify-start">
        <div className="flex flex-col gap-1">
            <label className="leading-[18px] text-lg">Username</label>
            <Input defaultValue={state ? state.values ? state.values.username : '':''} required name="username" type="text" placeholder="e.g. aurora_cloud" />
            <p className="text-xs text-red-400">{state ? state.error ? state?.location === 'username' ? state.message : null : null : null }</p>
        </div>
        <div className="flex flex-col gap-1">
            <label className="leading-[18px] text-lg">Password</label>
            <Input required defaultValue={state ? state.values ? state.values.password : '':''} name="password" type="password" placeholder="super secret password" />
            <p className="text-xs text-red-400">{state ? state.error ? state?.location === 'password' ? state.message : null : null : null }</p>
        </div>
        <Button loading={pending} type="submit">Sign Up</Button>
    </form>
    )
}
import { useEffect } from "react";

export default function useShortcutHandler() {
useEffect(() => {
    document.addEventListener("keydown", (e) => {
        if (e.key === "n" && e.ctrlKey) {
            e.preventDefault()
            console.log("Create new folder")
        }
    })
}, [])

}
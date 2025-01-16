'use client'
import { useFormStatus } from "react-dom";
import { createUpload, downloadFile } from "./actions";
import { useActionState, useOptimistic, useState, useTransition } from "react";
import { UploadResponse } from "@repo/types";

const TestForm = () => {
  const [pending, startTransition] = useTransition();
  
    if (pending) {
      return <p>Uploading...</p>;
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      console.log('submit')
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      startTransition(async () => {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: data,
        });

      });
    }
  
    return (
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="file">Select File</label>
          <input type="file" id="file" name="file" />
        </div>
        <button type="submit">Upload</button>
      </form>
    )
  }

  
export const DownloadFileTest = ({ name, id }: { name: string; id: string; }) => {
  'use client'
  let [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState('');
  return (
    <>
    <button onClick={() => {
      startTransition(async () => {
        const rurl = await downloadFile(name, id)
        setUrl(rurl)
      })
    }}>Download File</button>
    {
      url && (<a href={url}>Download</a>)
    }
    </>
  )
}

export default TestForm;
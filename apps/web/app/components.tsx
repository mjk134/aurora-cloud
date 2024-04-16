'use client'
import { useFormStatus, useFormState } from "react-dom";
import { createUpload, downloadFile } from "./actions";
import { useState, useTransition } from "react";

const TestForm = () => {
    'use client'
    const { pending } = useFormStatus();
    const [state, action] = useFormState<{error: boolean}>((state) => {
      return state;
    }, { error: false });
  
    if (pending) {
      return <p>Uploading...</p>;
    }
  
    return (
      <form action={createUpload}>
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
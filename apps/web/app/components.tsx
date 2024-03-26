'use client'
import { useFormStatus, useFormState } from "react-dom";
import { createUpload } from "./actions";

const TestForm = () => {
    'use client'
    const { pending } = useFormStatus();
    const { state, action } = useFormState<{}>(createUpload, {});
  
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

export default TestForm;
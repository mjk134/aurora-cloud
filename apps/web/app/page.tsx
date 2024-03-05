import Image from "next/image";
import styles from "./page.module.css";

export default function Page(): JSX.Element {
async function createUpload(data: FormData) {
  'use server'
  fetch("http://localhost:3000/upload", {
    method: "POST",
    body: data,
  });
}

  return (
    <main className={styles.main}>
      <form action={createUpload}>
        <h1>Upload Test</h1>
        <div>
          <label htmlFor="file">Select File</label>
          <input type="file" id="file" name="file" />
        </div>
        <button type="submit">Upload</button>
      </form>
    </main>
  );
}

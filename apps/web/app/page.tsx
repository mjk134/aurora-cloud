import { downloadFile } from "./actions";
import styles from "./page.module.css";
import FormTest from "./components";

const DownloadFileTest = ({ data }) => {
  'use client'
  return (
    <button>Download File</button>
  )
}

export default async function Page(): Promise<JSX.Element> {
  const data = await downloadFile();

  return (
    <main className={styles.main}>
      <h1>Upload Test</h1>
      <FormTest />
      <DownloadFileTest data={data} />
    </main>
  );
}

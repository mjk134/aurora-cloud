import styles from "./page.module.css";
import FormTest, { DownloadFileTest } from "./components";
import { sql } from "@vercel/postgres";


export default async function Page(): Promise<JSX.Element> {
  const files = await sql`SELECT * FROM file`;

  return (
    <main className={styles.main}>
      <h1>Upload Test</h1>
      <FormTest />
      <div></div>
      {
        files.rows.map((file) => {
          return (
            <div key={file.id} className="flex row">
              <p>{file.name}</p>
              <DownloadFileTest name={file.name} id={file.id} />
            </div>
          )
        })
      }
    </main>
  );
}

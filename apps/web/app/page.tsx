
import FormTest, { DownloadFileTest } from "./components";

import type { JSX } from "react";


export default async function Page(): Promise<JSX.Element> {

  return (
    <main>
      <h1>Upload Test</h1>
      <FormTest />
      <div></div>
      {/* {
        files.rows.map((file) => {
          return (
            <div key={file.id} className="flex row">
              <p>{file.name}</p>
              <DownloadFileTest name={file.name} id={file.id} />
            </div>
          )
        })
      } */}
    </main>
  );
}

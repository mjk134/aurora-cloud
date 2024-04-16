'use server'
import { sql } from "@vercel/postgres";

export async function createUpload(data: FormData) {
    const res = await fetch("http://localhost:3000/upload", {
      method: "POST",
      body: data,
    });
    let d = await res.text();
    if (d === "no file") {
      console.log("no file");
      return { error: true };
    }
    let json = JSON.parse(d);
    const file = data.get("file") as File;
    const fileInsert = await sql`INSERT INTO file VALUES(${json['files[0]']}, ${file.name});`
    const chunkInsert = await Promise.all(
        (json.attachments as string[])
        .map((a ,index) => {
            return sql`INSERT INTO file_storage VALUES(${index}, ${a}, ${json['files[0]']});`
        })
    )
    console.log(fileInsert, chunkInsert)
    return { error: false }
}

export async function downloadFile(name: string, fileId: string) {
    const chunkArr = await sql`SELECT * FROM file_storage WHERE id = ${fileId} ORDER BY chunk_index`;
    const stringified = Buffer.from(JSON.stringify({ file: name, chunks: chunkArr.rows })).toString('base64');
    return `http://localhost:3000/download?chunks=${stringified}`;
  }

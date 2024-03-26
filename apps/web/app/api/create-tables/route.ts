import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
 
export async function GET(request: Request) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }
    const result =
      await sql`
        CREATE TABLE IF NOT EXISTS file (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT
        );
        
        CREATE TABLE IF NOT EXISTS folder (
            id uuid UNIQUE PRIMARY KEY,
            CONSTRAINT fk_file
                FOREIGN KEY (id)
                REFERENCES file(id)
        );
        
        CREATE TABLE IF NOT EXISTS parent (
          file_id uuid,
          folder_id uuid,
          CONSTRAINT fk_folder
            FOREIGN KEY (folder_id)
            REFERENCES file(id),
          CONSTRAINT fk_file
            FOREIGN KEY (file_id)
            REFERENCES file(id)
        );
        
        CREATE TABLE IF NOT EXISTS type (
            id SMALLSERIAL PRIMARY KEY UNIQUE NOT NULL ,
            name TEXT
        );
        
        CREATE TABLE IF NOT EXISTS file_type (
            file_id uuid UNIQUE PRIMARY KEY,
            type_id SMALLSERIAL,
            CONSTRAINT fk_file
                FOREIGN KEY (file_id)
                REFERENCES file(id),
            CONSTRAINT fk_type
                FOREIGN KEY (type_id)
                REFERENCES type(id)
        );
        
        CREATE TABLE IF NOT EXISTS file_storage (
          id uuid PRIMARY KEY,
          chunk_index INTEGER,
          url TEXT,
          CONSTRAINT fk_file
            FOREIGN KEY (id)
            REFERENCES file(id)
        );
        
        CREATE TABLE IF NOT EXISTS text_storage (
            id uuid PRIMARY KEY,
            chunk_index INT,
            message_id TEXT,
            channel_id TEXT,
            CONSTRAINT fk_file
                FOREIGN KEY (id)
                REFERENCES file(id)
        );
    `;
    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
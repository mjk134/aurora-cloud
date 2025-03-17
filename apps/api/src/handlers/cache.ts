import { randomUUID } from "crypto";
import { Readable } from "stream";
import { encryptFileStream } from "./encryption";
import fs, { WriteStream } from "fs";
import fspromises from "fs/promises";

export default class CacheManager {
  public async removeFileFromCache(fileId: string) {
    // Check if the file exists
    if (!this.cache.has(fileId)) {
      return;
    }
    // Remove the file from the cache
    await fspromises.unlink("../cache/" + fileId);
  }
  private static instance: CacheManager;

  public static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  private cache = new Map<
    string,
    {
      type: "uploading" | "downloading";
      length: number;
    }
  >();

  public async addEncryptedFileToCache({
    readable,
  }: {
    readable: Readable;
  }): Promise<{
    fileId: string;
    key: Buffer;
    iv: Buffer;
    tag: Buffer;
    length: number;
  }> {
    const fileId = randomUUID();
    const writeStream = fs.createWriteStream("../cache/" + fileId, {
      flags: "a",
    });
    const encrypted = await encryptFileStream(readable, writeStream);
    this.cache.set(fileId, { type: "uploading", length: encrypted.length });
    console.log(encrypted.length + " bytes of data encrypted.");
    return {
      fileId,
      length: encrypted.length,
      key: encrypted.key,
      iv: encrypted.iv,
      tag: encrypted.tag,
    };
  }

  public getFileReadStreamFromCache(
    fileId: string,
    chunkSize?: number,
  ): fs.ReadStream {
    const file = fs.createReadStream("../cache/" + fileId, {
      highWaterMark: chunkSize,
    });
    return file;
  }

  public createFileWriteStreamToCache(fileId: string): WriteStream {
    const writeStream = fs.createWriteStream("../cache/" + fileId, {
      flags: "a",
    });
    this.cache.set(fileId, { type: "downloading", length: 0 });
    return writeStream;
  }

  public async getFileBufferFromCache(fileId: string): Promise<Buffer> {
    return fs.promises.readFile("../cache/" + fileId);
  }

  public getFileData(fileId: string):
    | {
        type: "uploading" | "downloading";
        length: number;
      }
    | undefined {
    return this.cache.get(fileId);
  }
}

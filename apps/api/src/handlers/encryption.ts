import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { WriteStream } from "fs";
import { Readable } from "stream";
/**
 * Encrypt a buffer using AES-192-GCM defined by the NIST
 * @param input The buffer to encrypt
 */
export function encryptBuffer(input: Buffer): {
  key: Buffer;
  buf: Buffer;
  iv: Buffer;
  tag: Buffer;
} {
  /**
   * The key is 24 bytes long.
   */
  const key = randomBytes(24);
  /**
   * The IV (intialisation vector) is 7 bytes long N >= 7 OR N <= 13
   * N determines allowed max ciphertext length (2 ** (8 * (15 - 7))) = 18,446,744,073,709,551,616
   */
  const iv = randomBytes(7);
  // Create a cipher object
  const cipher = createCipheriv(
    "aes-192-gcm",
    Uint8Array.from(key),
    Uint8Array.from(iv),
    {
      authTagLength: 16,
    },
  );
  // input can be chunked https://crypto.stackexchange.com/questions/95682/why-is-possible-to-encrypt-multiple-messages-within-the-same-stream-in-aes
  // Pass the data to be encrypted
  const chunkSize = 100 * 1024 * 1024; // 100 MB
  const maxChunks = Math.ceil(input.length / chunkSize);
  const chunks = [];
  for (let i = 0; i < maxChunks; i++) {
    const start = i * chunkSize;
    const end = (i + 1) * chunkSize;
    const data = cipher.update(Uint8Array.from(input.subarray(start, end)));
    chunks.push(Uint8Array.from(data));
  }
  const encrypted = Buffer.concat(chunks);

  cipher.final();
  // Get the authentication tag, which is used to verify the data integrity
  const tag = cipher.getAuthTag();
  return {
    key,
    buf: encrypted,
    iv,
    tag,
  };
}

export function decryptBuffer(
  inputBuffer: Buffer,
  key: Uint8Array,
  iv: Uint8Array,
  tag: Uint8Array,
): Buffer {
  const decipher = createDecipheriv("aes-192-gcm", key, iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);
  const chunkSize = 100 * 1024 * 1024; // 100MB
  const chunks = [];
  for (let i = 0; i < inputBuffer.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, inputBuffer.length);
    chunks.push(
      Uint8Array.from(
        decipher.update(Uint8Array.from(inputBuffer.subarray(i, end))),
      ),
    );
  }
  const plaintext = Buffer.concat(chunks);
  decipher.final();
  return plaintext;
}

export async function encryptFileStream(
  input: Readable,
  output: WriteStream,
): Promise<{
  key: Buffer;
  iv: Buffer;
  tag: Buffer;
  length: number;
}> {
  const key = randomBytes(24);
  const iv = randomBytes(7);
  const cipher = createCipheriv(
    "aes-192-gcm",
    Uint8Array.from(key),
    Uint8Array.from(iv),
    {
      authTagLength: 16,
    },
  );
  let totallength = 0;
  for await (const chunk of input) {
    const encrypted = cipher.update(Uint8Array.from(chunk as Buffer));
    totallength += encrypted.length
    output.write(Uint8Array.from(encrypted));
  }
  cipher.final();
  output.close();
  const tag = cipher.getAuthTag();
  return {
    key,
    iv,
    tag,
    length: totallength
  };
}


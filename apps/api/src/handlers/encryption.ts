import {
  CipherCCM,
  createCipheriv,
  createDecipheriv,
  DecipherCCM,
  randomBytes,
} from "crypto";
/**
 * Encrypt a buffer using AES-192-CCM defined by the NIST
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
    "aes-192-ccm",
    Uint8Array.from(key),
    Uint8Array.from(iv),
    {
      authTagLength: 16,
    },
  );
  // input can be chunked https://crypto.stackexchange.com/questions/95682/why-is-possible-to-encrypt-multiple-messages-within-the-same-stream-in-aes
  // Pass the data to be encrypted
  const encrypted = chunkFileWithEncryptionChipher(cipher, input);
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
  const decipher = createDecipheriv("aes-192-ccm", key, iv, {
    authTagLength: 16,
  });
  decipher.setAuthTag(tag);
  const plaintext = chunkFileWithDecryptionCipher(decipher, inputBuffer);
  decipher.final();
  return plaintext;
}

function chunkFileWithEncryptionChipher(cipher: CipherCCM, buf: Buffer) {
  const chunkSize = 100 * 1024 * 1024; // 5MB
  const chunks = [];
  for (let i = 0; i < buf.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, buf.length);
    chunks.push(
      Uint8Array.from(cipher.update(Uint8Array.from(buf.subarray(i, end)))),
    );
  }

  return Buffer.concat(chunks);
}

function chunkFileWithDecryptionCipher(decipher: DecipherCCM, buf: Buffer) {
  const chunkSize = 100 * 1024 * 1024; // 5MB
  const chunks = [];
  for (let i = 0; i < buf.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, buf.length);
    chunks.push(
      Uint8Array.from(decipher.update(Uint8Array.from(buf.subarray(i, end)))),
    );
  }

  return Buffer.concat(chunks);
}

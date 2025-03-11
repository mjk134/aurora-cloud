import { createCipheriv, randomBytes } from "crypto";

export function encryptFile(file: Buffer): {
    key: Buffer;
    encryptedFile: Buffer;
    iv: Buffer;
    tag: Buffer;
} {
    const key = randomBytes(24);
    const uintArr = new Uint8Array(key.buffer, key.byteOffset, key.byteLength)
    const iv = randomBytes(11)
    const ivUintArr = new Uint8Array(iv.buffer, iv.byteOffset, iv.byteLength)
    const cipher = createCipheriv('aes-192-ccm', uintArr, ivUintArr, {
        authTagLength: 16,
    });
    const fileArray = new Uint8Array(file.buffer, file.byteOffset, file.byteLength)
    const encrypted = cipher.update(fileArray);
    const tag = cipher.getAuthTag();
    cipher.final();
    return {
        key,
        encryptedFile: encrypted,
        iv,
        tag,
    }
}
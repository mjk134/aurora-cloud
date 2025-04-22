import crypto from "crypto";

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex"); // Generate a random salt
  // Use sha512 with PBKDF2 to hash the password
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return { salt, hash };
}

export function verifyPassword(password: string, hash: string, salt: string) {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify;
}

// Password must contain at least one uppercase letter, one lowercase letter, and one number.
// Password must be between 8 and 20 characters long
export const passwordRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,20})",
);

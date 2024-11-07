import crypto from 'crypto';

export function hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

export function verifyPassword(password: string, hash: string, salt: string) {
    const hashVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === hashVerify;
}
import * as crypto from 'crypto';
import * as CryptoJS from 'crypto-js';

export const hashHmac = (data: string): string => {
  const hash = crypto.createHmac('sha256', process.env.HASH_SECRET).update(data).digest('hex');
  console.log(hash);
  return hash;
};

export const hashSHA256 = (input: string): string => {
  try {
    // Tạo băm SHA-256 từ chuỗi input
    const hash = crypto.createHash('sha256').update(input, 'utf-8').digest();
    return byteToHexString(hash);
  } catch (error) {
    console.error('Error generating SHA-256 encryption:', error);
    return '';
  }
};

export const byteToHexString = (bytes: Buffer): string => {
  // Chuyển đổi buffer byte thành chuỗi hex
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export function getSHA256Encryption(str: string): string | null {
  try {
    const hash = crypto.createHash('sha256');
    const digest = hash.update(str, 'utf-8').digest();
    return byte2hexString(digest);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function byte2hexString(bytes: Buffer): string {
  return Array.from(bytes)
    .map((byte) => (byte < 16 ? '0' : '') + byte.toString(16))
    .join('');
}

export const encryptAES = (data: any) => {
  const encoded = CryptoJS.AES.encrypt(JSON.stringify(data), process.env.AES_SECRET_KEY).toString();
  const base64 = CryptoJS.enc.Base64.parse(encoded);
  return base64.toString(CryptoJS.enc.Hex);
};

export const decryptAES = (encrypted: string) => {
  const hex = CryptoJS.enc.Hex.parse(encrypted);
  const bytes = hex.toString(CryptoJS.enc.Base64);
  const decrypt = CryptoJS.AES.decrypt(bytes, process.env.AES_SECRET_KEY);
  return decrypt.toString(CryptoJS.enc.Utf8);
};

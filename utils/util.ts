import { sha256 } from "js-sha256";
import { arrayBufferToWebP } from "webp-converter-browser";
import imageCompression from "browser-image-compression";

export const validateEmail = (email: string): boolean => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i;
  return re.test(String(email).toLowerCase());
};

export function create_doc_id(name: string): string {
  return sha256(name);
}

export function getByteSize(str: string) {
  return new Blob([str]).size;
}

/**
 * Convert image to webp and compress it
 * @param file File
 * @param maxSize number (in MB)
 * @param maxWidthOrHeight number (in pixels)
 * @param isRemoveBackground boolean
 * @returns File
 */
export async function ConvertImageAndCompress(
  file: File,
  maxSize: number,
  maxWidthOrHeight: number
): Promise<File> {
  console.log("Trying to convert to webp...");
  const buf = await file.arrayBuffer();
  var blobToFile: File = (await arrayBufferToWebP(buf)) as File;
  const hoverFileOptions = {
    maxSizeMB: maxSize,
    maxWidthOrHeight: maxWidthOrHeight,
    useWebWorker: true,
  };
  const compressedHoverFile = await imageCompression(
    blobToFile,
    hoverFileOptions
  );
  return compressedHoverFile;
}

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const camelToSnake = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const convertKeysToSnakeCase = (obj: any): any => {
  if (Array.isArray(obj)) {
      return obj.map(v => convertKeysToSnakeCase(v));
  } else if (obj !== null && obj.constructor === Object) {
      return Object.keys(obj).reduce((result, key) => {
          const newKey = camelToSnake(key);
          result[newKey] = convertKeysToSnakeCase(obj[key]);
          return result;
      }, {} as any);
  }
  return obj;
};
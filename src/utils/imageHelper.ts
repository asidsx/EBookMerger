/**
 * Safe Image & Data URI Decoder/Encoder
 * Handles standard Base64 (PNG, JPG, WebP, GIF), UTF-8 / SVG with Cyrillic/Unicode characters,
 * and malformed data URLs without crashing `atob` / `btoa`.
 */

export interface DecodedImage {
  bytes: Uint8Array;
  mime: string;
  base64: string;
  ext: string;
}

export function decodeImageSafe(dataUriOrBase64: string, fallbackMime: string = 'image/jpeg'): DecodedImage {
  let raw = (dataUriOrBase64 || '').trim();
  let mime = fallbackMime;
  let isBase64 = false;
  let isSvg = false;

  if (raw.startsWith('data:')) {
    const commaIndex = raw.indexOf(',');
    if (commaIndex !== -1) {
      const header = raw.slice(0, commaIndex);
      const dataPart = raw.slice(commaIndex + 1);

      const mimeMatch = header.match(/data:([^;]+)/);
      if (mimeMatch) {
        mime = mimeMatch[1].trim();
      }

      isBase64 = header.includes(';base64');
      isSvg = mime.includes('svg');
      raw = dataPart;
    }
  }

  // Determine file extension
  let ext = 'jpg';
  if (mime.includes('png')) ext = 'png';
  else if (mime.includes('svg')) ext = 'svg';
  else if (mime.includes('webp')) ext = 'webp';
  else if (mime.includes('gif')) ext = 'gif';

  // 1. If it's pure SVG XML (whether data URI decoded or raw SVG text)
  if (isSvg || raw.startsWith('<svg') || raw.includes('<svg')) {
    try {
      const decodedText = decodeURIComponent(raw);
      const encoder = new TextEncoder();
      const bytes = encoder.encode(decodedText);
      
      // Convert UTF-8 bytes to clean Base64
      let binaryStr = '';
      for (let i = 0; i < bytes.length; i++) {
        binaryStr += String.fromCharCode(bytes[i]);
      }
      const cleanBase64 = btoa(binaryStr);

      return {
        bytes,
        mime: 'image/svg+xml',
        base64: cleanBase64,
        ext: 'svg',
      };
    } catch {
      const encoder = new TextEncoder();
      const bytes = encoder.encode(raw);
      let binaryStr = '';
      for (let i = 0; i < bytes.length; i++) {
        binaryStr += String.fromCharCode(bytes[i]);
      }
      return {
        bytes,
        mime: 'image/svg+xml',
        base64: btoa(binaryStr),
        ext: 'svg',
      };
    }
  }

  // 2. Base64 encoded binary image
  const sanitizedBase64 = raw.replace(/\s+/g, '');
  try {
    const binaryString = atob(sanitizedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return {
      bytes,
      mime,
      base64: sanitizedBase64,
      ext,
    };
  } catch {
    // Fallback: UTF-8 encoding if string had characters outside Latin1
    const encoder = new TextEncoder();
    const bytes = encoder.encode(raw);
    let binaryStr = '';
    for (let i = 0; i < bytes.length; i++) {
      binaryStr += String.fromCharCode(bytes[i]);
    }
    return {
      bytes,
      mime: 'image/svg+xml',
      base64: btoa(binaryStr),
      ext: 'svg',
    };
  }
}

import { ChapterItem, BookImage } from '../../types/book';
import { decodeImageSafe } from '../imageHelper';

export function buildFB2(chapters: ChapterItem[], bookTitle: string = 'Merged Book'): string {
  const allImages: Record<string, BookImage> = {};
  const imageKeyMap: Record<string, string> = {}; // oldId -> uniqueBinId

  // Collect and remap all images
  chapters.forEach((chap) => {
    Object.entries(chap.images || {}).forEach(([oldId, img]) => {
      if (!imageKeyMap[oldId]) {
        const newId = `img_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
        imageKeyMap[oldId] = newId;
        allImages[newId] = {
          ...img,
          id: newId,
        };
      }
    });
  });

  const escapeXml = (str: string) => {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  let sectionsXml = '';

  chapters.forEach((chap) => {
    sectionsXml += `    <section>\n`;
    sectionsXml += `      <title><p>${escapeXml(chap.title)}</p></title>\n`;

    chap.paragraphs.forEach((para) => {
      const trimmed = para.trim();
      if (!trimmed) {
        sectionsXml += `      <empty-line/>\n`;
        return;
      }

      if (trimmed.startsWith('### ')) {
        sectionsXml += `      <subtitle>${escapeXml(trimmed.slice(4))}</subtitle>\n`;
        return;
      }

      const imgMatch = trimmed.match(/^\[IMG:([^\]]+)\]$/);
      if (imgMatch) {
        const oldId = imgMatch[1];
        const remappedId = imageKeyMap[oldId] || oldId;
        sectionsXml += `      <p><image l:href="#${remappedId}"/></p>\n`;
        return;
      }

      sectionsXml += `      <p>${escapeXml(trimmed)}</p>\n`;
    });

    sectionsXml += `    </section>\n`;
  });

  // Binary tags
  let binariesXml = '';
  Object.values(allImages).forEach((img) => {
    try {
      const decoded = decodeImageSafe(img.data, img.type || 'image/jpeg');
      if (decoded.base64) {
        binariesXml += `  <binary id="${img.id}" content-type="${decoded.mime}">${decoded.base64}</binary>\n`;
      }
    } catch (err) {
      console.warn(`Failed to encode FB2 binary image ${img.id}:`, err);
    }
  });

  const fb2Content = `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
  <description>
    <title-info>
      <genre>prose</genre>
      <author><last-name>Universal Chapter &amp; Book Merger</last-name></author>
      <book-title>${escapeXml(bookTitle)}</book-title>
      <lang>ru</lang>
      <date>${new Date().toISOString().split('T')[0]}</date>
    </title-info>
    <document-info>
      <author><nickname>Book Merger V11.0</nickname></author>
      <program-used>Universal Chapter &amp; Book Merger V11.0</program-used>
      <date>${new Date().toISOString().split('T')[0]}</date>
      <id>${crypto.randomUUID()}</id>
      <version>1.0</version>
    </document-info>
  </description>
  <body>
${sectionsXml}  </body>
${binariesXml}</FictionBook>`;

  return fb2Content;
}

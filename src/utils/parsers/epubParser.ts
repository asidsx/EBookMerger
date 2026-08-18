import JSZip from 'jszip';
import { ChapterItem, BookImage } from '../../types/book';

export async function parseEPUB(fileData: ArrayBuffer | Uint8Array, bookId: string, bookName: string): Promise<ChapterItem[]> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(fileData);

  // 1. Read container.xml to locate root .opf
  let opfPath = 'OEBPS/content.opf';
  const containerFile = loadedZip.file('META-INF/container.xml');
  if (containerFile) {
    const containerXml = await containerFile.async('text');
    const parser = new DOMParser();
    const doc = parser.parseFromString(containerXml, 'text/xml');
    const rootfile = doc.getElementsByTagName('rootfile')[0];
    if (rootfile) {
      const fullPath = rootfile.getAttribute('full-path');
      if (fullPath) opfPath = fullPath;
    }
  }

  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';

  // 2. Read OPF manifest & spine
  const opfFile = loadedZip.file(opfPath) || loadedZip.file(opfPath.toLowerCase());
  if (!opfFile) {
    throw new Error('EPUB content.opf not found');
  }

  const opfText = await opfFile.async('text');
  const parser = new DOMParser();
  const opfDoc = parser.parseFromString(opfText, 'text/xml');

  // Manifest items
  const manifestItems = new Map<string, { href: string; mediaType: string }>();
  const itemNodes = opfDoc.getElementsByTagName('item');
  for (let i = 0; i < itemNodes.length; i++) {
    const it = itemNodes[i];
    const id = it.getAttribute('id') || '';
    const href = it.getAttribute('href') || '';
    const mediaType = it.getAttribute('media-type') || '';
    manifestItems.set(id, { href, mediaType });
  }

  // Load all images in manifest
  const images: Record<string, BookImage> = {};
  for (const [id, item] of manifestItems.entries()) {
    if (item.mediaType.startsWith('image/')) {
      const fullImgPath = opfDir + item.href;
      const imgFile = loadedZip.file(fullImgPath) || loadedZip.file(item.href);
      if (imgFile) {
        const base64 = await imgFile.async('base64');
        images[id] = {
          id,
          type: item.mediaType,
          data: `data:${item.mediaType};base64,${base64}`,
          fileName: item.href,
        };
      }
    }
  }

  // Spine items in order
  const spineIds: string[] = [];
  const itemrefNodes = opfDoc.getElementsByTagName('itemref');
  for (let i = 0; i < itemrefNodes.length; i++) {
    const idref = itemrefNodes[i].getAttribute('idref');
    if (idref) spineIds.push(idref);
  }

  // 3. Process HTML spine chapters
  const chapters: ChapterItem[] = [];
  let chapCounter = 1;

  for (const idref of spineIds) {
    const item = manifestItems.get(idref);
    if (!item) continue;

    const htmlPath = opfDir + item.href;
    const htmlFile = loadedZip.file(htmlPath) || loadedZip.file(item.href);
    if (!htmlFile) continue;

    // Filter out titlepage/cover if empty
    const fileNameLower = item.href.toLowerCase();
    if (fileNameLower.includes('cover') && !fileNameLower.includes('chapter')) {
      continue;
    }

    const htmlText = await htmlFile.async('text');
    const htmlDoc = parser.parseFromString(htmlText, 'text/html');

    // Remove scripts and styles
    htmlDoc.querySelectorAll('script, style').forEach((el) => el.remove());

    // Detect title from h1, h2, or <title>
    let chapterTitle = '';
    const h1 = htmlDoc.querySelector('h1, h2, h3');
    if (h1 && h1.textContent?.trim()) {
      chapterTitle = h1.textContent.trim();
    } else if (htmlDoc.title && htmlDoc.title.trim()) {
      chapterTitle = htmlDoc.title.trim();
    } else {
      chapterTitle = `Глава ${chapCounter}`;
    }

    // Extract text paragraphs
    const paragraphs: string[] = [];
    const elements = htmlDoc.body ? htmlDoc.body.children : [];

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const tag = el.tagName.toLowerCase();

      if (['h1', 'h2', 'h3'].includes(tag)) {
        if (!chapterTitle || chapterTitle.startsWith('Глава ')) {
          chapterTitle = el.textContent?.trim() || chapterTitle;
        } else if (el.textContent?.trim()) {
          paragraphs.push(`### ${el.textContent.trim()}`);
        }
        continue;
      }

      if (tag === 'img') {
        const src = el.getAttribute('src');
        if (src) {
          // match image
          const matchedImg = Object.values(images).find((img) => img.fileName && src.includes(img.fileName));
          if (matchedImg) {
            paragraphs.push(`[IMG:${matchedImg.id}]`);
          }
        }
        continue;
      }

      const text = el.textContent?.trim();
      if (text) {
        paragraphs.push(text);
      }
    }

    // If no direct paragraphs found, collect all <p>
    if (paragraphs.length === 0) {
      const pNodes = htmlDoc.querySelectorAll('p');
      pNodes.forEach((p) => {
        const txt = p.textContent?.trim();
        if (txt) paragraphs.push(txt);
      });
    }

    const fullText = paragraphs.join(' ');
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    if (paragraphs.length > 0) {
      chapters.push({
        id: crypto.randomUUID(),
        bookId,
        bookName,
        title: chapterTitle,
        paragraphs,
        images,
        checked: false,
        wordCount,
      });
      chapCounter++;
    }
  }

  return chapters;
}

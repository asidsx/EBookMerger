import JSZip from 'jszip';
import { ChapterItem, BookImage } from '../../types/book';

export async function parseDOCX(fileData: ArrayBuffer | Uint8Array, bookId: string, bookName: string): Promise<ChapterItem[]> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(fileData);

  // 1. Read document relationships for media
  const relsFile = loadedZip.file('word/_rels/document.xml.rels');
  const rIdToTarget: Record<string, string> = {};
  if (relsFile) {
    const relsXml = await relsFile.async('text');
    const parser = new DOMParser();
    const relsDoc = parser.parseFromString(relsXml, 'text/xml');
    const relNodes = relsDoc.getElementsByTagName('Relationship');
    for (let i = 0; i < relNodes.length; i++) {
      const id = relNodes[i].getAttribute('Id');
      const target = relNodes[i].getAttribute('Target');
      const type = relNodes[i].getAttribute('Type') || '';
      if (id && target && (type.includes('image') || target.match(/\.(png|jpg|jpeg|gif)$/i))) {
        rIdToTarget[id] = target.replace(/^media\//, 'word/media/').replace(/^\//, '');
        if (!rIdToTarget[id].startsWith('word/')) {
          rIdToTarget[id] = 'word/' + target;
        }
      }
    }
  }

  // 2. Extract media images
  const images: Record<string, BookImage> = {};
  for (const [rId, targetPath] of Object.entries(rIdToTarget)) {
    const mediaFile = loadedZip.file(targetPath);
    if (mediaFile) {
      const ext = targetPath.split('.').pop()?.toLowerCase() || 'jpeg';
      const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
      const base64 = await mediaFile.async('base64');
      images[rId] = {
        id: rId,
        type: mime,
        data: `data:${mime};base64,${base64}`,
        fileName: targetPath,
      };
    }
  }

  // 3. Read word/document.xml
  const docFile = loadedZip.file('word/document.xml');
  if (!docFile) {
    throw new Error('word/document.xml not found');
  }

  const docXml = await docFile.async('text');
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(docXml, 'text/xml');

  const pNodes = xmlDoc.getElementsByTagName('w:p');
  const chapters: ChapterItem[] = [];

  let currentTitle = `${bookName} - Часть 1`;
  let currentParagraphs: string[] = [];
  let isFirstChapter = true;

  const flushChapter = () => {
    if (currentParagraphs.length > 0) {
      const fullText = currentParagraphs.join(' ');
      chapters.push({
        id: crypto.randomUUID(),
        bookId,
        bookName,
        title: currentTitle,
        paragraphs: [...currentParagraphs],
        images,
        checked: false,
        wordCount: fullText.split(/\s+/).filter(Boolean).length,
      });
      currentParagraphs = [];
    }
  };

  for (let i = 0; i < pNodes.length; i++) {
    const p = pNodes[i];

    // Extract text
    const textRuns = p.getElementsByTagName('w:t');
    let pText = '';
    for (let j = 0; j < textRuns.length; j++) {
      pText += textRuns[j].textContent || '';
    }
    pText = pText.trim();

    // Check style and bold
    const styleNode = p.querySelector('pStyle, w\\:pStyle');
    const styleVal = (styleNode?.getAttribute('w:val') || styleNode?.getAttribute('val') || '').toLowerCase();
    
    const boldNode = p.querySelector('b, w\\:b');
    const isBold = !!boldNode;

    const isHeading =
      styleVal.includes('heading') ||
      styleVal.includes('заголовок') ||
      styleVal.includes('title') ||
      (isBold && pText.length < 90 && pText.length > 2);

    const isChapterKeyword = /^(глава|chapter|пролог|эпилог|часть|том|act|scene)\b/i.test(pText);

    // If heading found, start new chapter section
    if ((isHeading || isChapterKeyword) && pText.length > 0) {
      if (!isFirstChapter) {
        flushChapter();
      }
      currentTitle = pText;
      isFirstChapter = false;
      continue;
    }

    // Check for images inside paragraph
    const blipNodes = p.getElementsByTagName('a:blip');
    let hasImage = false;
    for (let k = 0; k < blipNodes.length; k++) {
      const embedId = blipNodes[k].getAttribute('r:embed');
      if (embedId && images[embedId]) {
        currentParagraphs.push(`[IMG:${embedId}]`);
        hasImage = true;
      }
    }

    if (pText.length > 0) {
      currentParagraphs.push(pText);
    }
  }

  // Flush remaining
  flushChapter();

  if (chapters.length === 0) {
    chapters.push({
      id: crypto.randomUUID(),
      bookId,
      bookName,
      title: bookName,
      paragraphs: ['[Пустой документ DOCX]'],
      images,
      checked: false,
      wordCount: 0,
    });
  }

  return chapters;
}

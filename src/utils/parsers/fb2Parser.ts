import { ChapterItem, BookImage } from '../../types/book';

export function parseFB2(xmlText: string, bookId: string, bookName: string): ChapterItem[] {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

  // Check parsing errors
  const parseError = xmlDoc.getElementsByTagName('parsererror')[0];
  if (parseError) {
    console.warn('FB2 XML parse warning, fallback regex extraction', parseError.textContent);
  }

  // 1. Extract all binary images
  const images: Record<string, BookImage> = {};
  const binaryNodes = xmlDoc.getElementsByTagName('binary');
  for (let i = 0; i < binaryNodes.length; i++) {
    const node = binaryNodes[i];
    const id = node.getAttribute('id') || `bin_${i}`;
    const contentType = node.getAttribute('content-type') || 'image/jpeg';
    const base64Data = (node.textContent || '').trim().replace(/\s+/g, '');
    if (base64Data) {
      images[id] = {
        id,
        type: contentType,
        data: `data:${contentType};base64,${base64Data}`,
      };
    }
  }

  // 2. Extract sections from body
  const bodyNodes = xmlDoc.getElementsByTagName('body');
  if (bodyNodes.length === 0) {
    return [
      {
        id: crypto.randomUUID(),
        bookId,
        bookName,
        title: bookName,
        paragraphs: ['Текст не найден или поврежден.'],
        images,
        checked: false,
        wordCount: 5,
      },
    ];
  }

  const primaryBody = bodyNodes[0];
  let sectionNodes = Array.from(primaryBody.querySelectorAll(':scope > section'));
  
  // If no direct child sections, query all sections or child elements
  if (sectionNodes.length === 0) {
    sectionNodes = Array.from(primaryBody.getElementsByTagName('section'));
  }

  const chapters: ChapterItem[] = [];

  if (sectionNodes.length === 0) {
    // Whole body as single chapter
    const paragraphs: string[] = [];
    const pNodes = primaryBody.getElementsByTagName('p');
    for (let i = 0; i < pNodes.length; i++) {
      const text = pNodes[i].textContent?.trim();
      if (text) paragraphs.push(text);
    }

    const fullText = paragraphs.join(' ');
    chapters.push({
      id: crypto.randomUUID(),
      bookId,
      bookName,
      title: bookName,
      paragraphs: paragraphs.length > 0 ? paragraphs : ['[Пустая глава]'],
      images,
      checked: false,
      wordCount: fullText.split(/\s+/).filter(Boolean).length,
    });
  } else {
    sectionNodes.forEach((sec, idx) => {
      // Find title
      let chapTitle = `Глава ${idx + 1}`;
      const titleElem = sec.querySelector(':scope > title') || sec.getElementsByTagName('title')[0];
      if (titleElem) {
        const titleP = titleElem.getElementsByTagName('p')[0];
        const rawTitle = (titleP ? titleP.textContent : titleElem.textContent)?.trim();
        if (rawTitle) chapTitle = rawTitle;
      }

      // Collect paragraphs
      const paragraphs: string[] = [];
      const childElems = sec.children;

      for (let j = 0; j < childElems.length; j++) {
        const el = childElems[j];
        const tag = el.tagName.toLowerCase().split(':').pop() || '';
        
        if (tag === 'title') continue;

        if (tag === 'p') {
          const txt = el.textContent?.trim();
          if (txt) paragraphs.push(txt);
          
          // Check for inline images
          const imgChild = el.getElementsByTagName('image')[0];
          if (imgChild) {
            const href = imgChild.getAttribute('l:href') || imgChild.getAttribute('xlink:href') || imgChild.getAttribute('href');
            if (href) {
              const cleanHref = href.replace(/^#/, '');
              paragraphs.push(`[IMG:${cleanHref}]`);
            }
          }
        } else if (tag === 'image') {
          const href = el.getAttribute('l:href') || el.getAttribute('xlink:href') || el.getAttribute('href');
          if (href) {
            const cleanHref = href.replace(/^#/, '');
            paragraphs.push(`[IMG:${cleanHref}]`);
          }
        } else if (tag === 'subtitle') {
          const subText = el.textContent?.trim();
          if (subText) paragraphs.push(`### ${subText}`);
        } else if (tag === 'empty-line') {
          paragraphs.push('');
        }
      }

      const chapterText = paragraphs.join(' ');
      const wordCount = chapterText.split(/\s+/).filter(Boolean).length;

      if (paragraphs.length > 0) {
        chapters.push({
          id: crypto.randomUUID(),
          bookId,
          bookName,
          title: chapTitle,
          paragraphs,
          images,
          checked: false,
          wordCount,
        });
      }
    });
  }

  return chapters.length > 0
    ? chapters
    : [
        {
          id: crypto.randomUUID(),
          bookId,
          bookName,
          title: bookName,
          paragraphs: ['[Книга без распознанного текста]'],
          images,
          checked: false,
          wordCount: 0,
        },
      ];
}

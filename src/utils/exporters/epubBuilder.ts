import JSZip from 'jszip';
import { ChapterItem } from '../../types/book';
import { decodeImageSafe } from '../imageHelper';

export async function buildEPUB(chapters: ChapterItem[], bookTitle: string = 'Merged Book'): Promise<Blob> {
  const zip = new JSZip();

  // 1. mimetype (must be uncompressed at start of archive)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // 2. META-INF/container.xml
  const containerXml = `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', containerXml);

  // 3. Collect images safely
  const imagesMap = new Map<string, { id: string; fileName: string; mime: string; data: Uint8Array }>();
  let imgIndex = 1;

  for (const chap of chapters) {
    for (const [oldId, img] of Object.entries(chap.images || {})) {
      if (!imagesMap.has(oldId)) {
        try {
          const decoded = decodeImageSafe(img.data, img.type || 'image/jpeg');
          const imgFileName = `img_${imgIndex}.${decoded.ext}`;

          imagesMap.set(oldId, {
            id: `img_${imgIndex}`,
            fileName: imgFileName,
            mime: decoded.mime,
            data: decoded.bytes,
          });

          zip.file(`OEBPS/images/${imgFileName}`, decoded.bytes);
          imgIndex++;
        } catch (err) {
          console.warn(`Failed to encode image ${oldId}:`, err);
        }
      }
    }
  }

  // 4. Stylesheet
  const cssContent = `
body {
  font-family: Georgia, serif;
  margin: 5% 5%;
  line-height: 1.6;
  color: #222;
}
h2 {
  font-size: 1.6em;
  color: #111;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.3em;
  margin-top: 1.5em;
  margin-bottom: 1em;
  text-align: center;
}
h3 {
  font-size: 1.2em;
  margin-top: 1.2em;
  margin-bottom: 0.5em;
}
p {
  text-indent: 1.5em;
  margin-top: 0;
  margin-bottom: 0.5em;
}
.image-wrap {
  text-align: center;
  margin: 1.5em 0;
}
.image-wrap img {
  max-width: 95%;
  height: auto;
  border-radius: 4px;
}
`;
  zip.file('OEBPS/style.css', cssContent);

  const escapeXml = (str: string) => {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  // 5. Generate XHTML for each chapter
  const manifestItems: { id: string; href: string; mediaType: string }[] = [
    { id: 'style', href: 'style.css', mediaType: 'text/css' },
    { id: 'ncx', href: 'toc.ncx', mediaType: 'application/x-dtbncx+xml' },
  ];

  // Add images to manifest
  for (const img of imagesMap.values()) {
    manifestItems.push({
      id: img.id,
      href: `images/${img.fileName}`,
      mediaType: img.mime,
    });
  }

  const spineItems: string[] = [];
  const ncxNavPoints: { id: string; title: string; src: string; playOrder: number }[] = [];

  chapters.forEach((chap, idx) => {
    const chapNum = idx + 1;
    const chapId = `chap_${chapNum}`;
    const chapFile = `chap_${chapNum}.xhtml`;

    manifestItems.push({
      id: chapId,
      href: chapFile,
      mediaType: 'application/xhtml+xml',
    });
    spineItems.push(chapId);
    ncxNavPoints.push({
      id: `nav_${chapNum}`,
      title: chap.title,
      src: chapFile,
      playOrder: chapNum,
    });

    let chapterHtml = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="ru">
<head>
  <meta charset="utf-8"/>
  <title>${escapeXml(chap.title)}</title>
  <link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body>
  <h2>${escapeXml(chap.title)}</h2>
`;

    chap.paragraphs.forEach((para) => {
      const trimmed = para.trim();
      if (!trimmed) {
        chapterHtml += `  <br/>\n`;
        return;
      }

      if (trimmed.startsWith('### ')) {
        chapterHtml += `  <h3>${escapeXml(trimmed.slice(4))}</h3>\n`;
        return;
      }

      const imgMatch = trimmed.match(/^\[IMG:([^\]]+)\]$/);
      if (imgMatch) {
        const oldId = imgMatch[1];
        const imgObj = imagesMap.get(oldId);
        if (imgObj) {
          chapterHtml += `  <div class="image-wrap"><img src="images/${imgObj.fileName}" alt=""/></div>\n`;
        }
        return;
      }

      chapterHtml += `  <p>${escapeXml(trimmed)}</p>\n`;
    });

    chapterHtml += `</body>\n</html>`;
    zip.file(`OEBPS/${chapFile}`, chapterHtml);
  });

  // 6. OEBPS/toc.ncx (for EPUB 2/3 compatibility)
  let ncxPointsXml = '';
  ncxNavPoints.forEach((np) => {
    ncxPointsXml += `    <navPoint id="${np.id}" playOrder="${np.playOrder}">
      <navLabel><text>${escapeXml(np.title)}</text></navLabel>
      <content src="${np.src}"/>
    </navPoint>\n`;
  });

  const ncxContent = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="urn:uuid:${crypto.randomUUID()}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(bookTitle)}</text></docTitle>
  <navMap>
${ncxPointsXml}  </navMap>
</ncx>`;
  zip.file('OEBPS/toc.ncx', ncxContent);

  // 7. OEBPS/content.opf
  let manifestXml = '';
  manifestItems.forEach((m) => {
    manifestXml += `    <item id="${m.id}" href="${m.href}" media-type="${m.mediaType}"/>\n`;
  });

  let spineXml = '';
  spineItems.forEach((s) => {
    spineXml += `    <itemref idref="${s}"/>\n`;
  });

  const opfContent = `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">
    <dc:title>${escapeXml(bookTitle)}</dc:title>
    <dc:language>ru</dc:language>
    <dc:identifier id="BookID">urn:uuid:${crypto.randomUUID()}</dc:identifier>
    <dc:creator>Universal Chapter &amp; Book Merger</dc:creator>
    <dc:date>${new Date().toISOString().split('T')[0]}</dc:date>
  </metadata>
  <manifest>
${manifestXml}  </manifest>
  <spine toc="ncx">
${spineXml}  </spine>
</package>`;
  zip.file('OEBPS/content.opf', opfContent);

  // Build blob
  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}

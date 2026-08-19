import JSZip from 'jszip';
import { ChapterItem, ExportFormat } from '../../types/book';
import { buildFB2 } from './fb2Builder';
import { buildEPUB } from './epubBuilder';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl ? dataUrl.split(',')[1] : '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function deliverFile(blob: Blob, fileName: string, mimeType: string): Promise<string> {
  // 1. Check if running inside native Android wrapper
  if (typeof (window as any).AndroidBridge !== 'undefined' && typeof (window as any).AndroidBridge.saveBook === 'function') {
    const base64Data = await blobToBase64(blob);
    const saved = (window as any).AndroidBridge.saveBook(fileName, base64Data, mimeType);
    if (saved) {
      return `Книга "${fileName}" успешно сохранена в папку Документы/Books на вашем устройстве!`;
    }
  }

  // 2. Web Browser / Desktop fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);

  return `Книга "${fileName}" успешно скачана!`;
}

export async function exportMergedBook(
  chapters: ChapterItem[],
  format: ExportFormat,
  bookTitle: string,
  onProgress?: (step: string) => void
): Promise<{ success: boolean; message: string }> {
  if (!chapters || chapters.length === 0) {
    throw new Error('Нет глав для сборки!');
  }

  const safeTitle = (bookTitle || 'MyMergedBook').trim().replace(/[/\\?%*:|"<>]/g, '_');

  if (format === 'fb2') {
    onProgress?.('Генерация файла FB2 FictionBook...');
    const fb2Xml = buildFB2(chapters, safeTitle);
    const blob = new Blob([fb2Xml], { type: 'application/x-fictionbook+xml;charset=utf-8' });
    const msg = await deliverFile(blob, `${safeTitle}.fb2`, 'application/x-fictionbook+xml');
    return { success: true, message: msg };
  }

  if (format === 'epub') {
    onProgress?.('Сборка архива EPUB...');
    const epubBlob = await buildEPUB(chapters, safeTitle);
    const msg = await deliverFile(epubBlob, `${safeTitle}.epub`, 'application/epub+zip');
    return { success: true, message: msg };
  }

  if (format === 'both') {
    onProgress?.('Генерация FB2 и EPUB файлов...');
    const fb2Xml = buildFB2(chapters, safeTitle);
    const epubBlob = await buildEPUB(chapters, safeTitle);

    onProgress?.('Упаковка в ZIP архив...');
    const zip = new JSZip();
    zip.file(`${safeTitle}.fb2`, fb2Xml);
    zip.file(`${safeTitle}.epub`, epubBlob);

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const msg = await deliverFile(zipBlob, `${safeTitle}_both_formats.zip`, 'application/zip');
    return {
      success: true,
      message: msg,
    };
  }

  return { success: false, message: 'Неизвестный формат сборки' };
}

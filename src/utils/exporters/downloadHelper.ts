import JSZip from 'jszip';
import { ChapterItem, ExportFormat } from '../../types/book';
import { buildFB2 } from './fb2Builder';
import { buildEPUB } from './epubBuilder';

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

  const triggerDownload = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  };

  if (format === 'fb2') {
    onProgress?.('Генерация файла FB2 FictionBook...');
    const fb2Xml = buildFB2(chapters, safeTitle);
    const blob = new Blob([fb2Xml], { type: 'application/x-fictionbook+xml;charset=utf-8' });
    triggerDownload(blob, `${safeTitle}.fb2`);
    return { success: true, message: `Книга "${safeTitle}.fb2" успешно собрана и скачана!` };
  }

  if (format === 'epub') {
    onProgress?.('Сборка архива EPUB...');
    const epubBlob = await buildEPUB(chapters, safeTitle);
    triggerDownload(epubBlob, `${safeTitle}.epub`);
    return { success: true, message: `Книга "${safeTitle}.epub" успешно собрана и скачана!` };
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
    triggerDownload(zipBlob, `${safeTitle}_both_formats.zip`);
    return {
      success: true,
      message: `Оба формата (FB2 + EPUB) упакованы в ZIP и успешно скачаны!`,
    };
  }

  return { success: false, message: 'Неизвестный формат сборки' };
}

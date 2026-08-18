import React, { useState, useEffect } from 'react';
import { BookItem, ChapterItem, ExportFormat, ActiveTab, MergeProgress } from './types/book';
import { TopHeader } from './components/TopHeader';
import { LeftBooksPanel } from './components/LeftBooksPanel';
import { MiddleChaptersPanel } from './components/MiddleChaptersPanel';
import { RightReaderPanel } from './components/RightReaderPanel';
import { BottomToolbar } from './components/BottomToolbar';
import { NotificationModal } from './components/NotificationModal';
import { SmartSorter } from './utils/sorter';
import { parseFB2 } from './utils/parsers/fb2Parser';
import { parseEPUB } from './utils/parsers/epubParser';
import { parseDOCX } from './utils/parsers/docxParser';
import { exportMergedBook } from './utils/exporters/downloadHelper';
import { getSampleBooks } from './utils/sampleBooks';

export default function App() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('files');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('fb2');
  const [bookTitleOverride, setBookTitleOverride] = useState<string>('MyMergedBook');
  const [statusText, setStatusText] = useState<string>('Готов к работе');
  const [mergeProgress, setMergeProgress] = useState<MergeProgress>({
    isMerging: false,
    currentStep: '',
    progressPercent: 0,
  });
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });

  // Load sample demo books on initial load so the app is immediately useful
  useEffect(() => {
    const samples = getSampleBooks();
    setBooks(samples.books);
    setChapters(samples.chapters);
    if (samples.chapters.length > 0) {
      setSelectedChapterId(samples.chapters[0].id);
    }
    setStatusText(`Загружены 3 демо-книги (${samples.chapters.length} глав)`);
  }, []);

  // 1. File Upload / Parsing Handler
  const handleFilesSelected = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    setStatusText(`Распаковка ${files.length} файл(ов)...`);

    const newBooks: BookItem[] = [];
    const newChapters: ChapterItem[] = [];

    for (const file of files) {
      const fileName = file.name;
      const ext = fileName.split('.').pop()?.toUpperCase() as 'FB2' | 'EPUB' | 'DOCX';
      const bookName = fileName.replace(/\.[^/.]+$/, '');
      const bookId = crypto.randomUUID();

      setStatusText(`Распаковка: ${fileName}...`);

      try {
        let extractedChapters: ChapterItem[] = [];

        if (ext === 'FB2' || fileName.toLowerCase().endsWith('.fb2')) {
          const text = await file.text();
          extractedChapters = parseFB2(text, bookId, bookName);
        } else if (ext === 'EPUB' || fileName.toLowerCase().endsWith('.epub')) {
          const buffer = await file.arrayBuffer();
          extractedChapters = await parseEPUB(buffer, bookId, bookName);
        } else if (ext === 'DOCX' || fileName.toLowerCase().endsWith('.docx')) {
          const buffer = await file.arrayBuffer();
          extractedChapters = await parseDOCX(buffer, bookId, bookName);
        } else {
          const text = await file.text();
          extractedChapters = [
            {
              id: crypto.randomUUID(),
              bookId,
              bookName,
              title: bookName,
              paragraphs: text.split('\n').filter((l) => l.trim().length > 0),
              images: {},
              checked: false,
              wordCount: text.split(/\s+/).filter(Boolean).length,
            },
          ];
        }

        const bookItem: BookItem = {
          id: bookId,
          name: bookName,
          fileName: fileName,
          ext: ext || 'FB2',
          sizeBytes: file.size,
          chapterCount: extractedChapters.length,
        };

        newBooks.push(bookItem);
        newChapters.push(...extractedChapters);
      } catch (err: any) {
        console.error(`Error parsing file ${fileName}:`, err);
        setModal({
          isOpen: true,
          type: 'error',
          title: 'Ошибка чтения файла',
          message: `Не удалось прочитать файл "${fileName}": ${err.message || 'Неизвестный формат'}`,
        });
      }
    }

    if (newBooks.length > 0) {
      setBooks((prev) => [...prev, ...newBooks]);
      setChapters((prev) => {
        const combined = [...prev, ...newChapters];
        if (!selectedChapterId && combined.length > 0) {
          setSelectedChapterId(combined[0].id);
        }
        return combined;
      });

      const totalB = books.length + newBooks.length;
      const totalC = chapters.length + newChapters.length;
      setStatusText(`Книг: ${totalB} | Всего глав: ${totalC}`);

      // Auto switch to chapters tab if adding new book
      setActiveTab('chapters');
    }
  };

  // 2. Load Sample Books
  const handleLoadSamples = () => {
    const samples = getSampleBooks();
    setBooks(samples.books);
    setChapters(samples.chapters);
    if (samples.chapters.length > 0) {
      setSelectedChapterId(samples.chapters[0].id);
    }
    setStatusText(`Книг: ${samples.books.length} | Всего глав: ${samples.chapters.length}`);
  };

  // 3. Reorder Books (Drag & Drop)
  const handleReorderBooks = (draggedId: string, targetIdx: number) => {
    const sourceIdx = books.findIndex((b) => b.id === draggedId);
    if (sourceIdx === -1) return;

    const newBooks = [...books];
    const [movedBook] = newBooks.splice(sourceIdx, 1);
    newBooks.splice(targetIdx, 0, movedBook);
    setBooks(newBooks);

    // Sync chapters to the new book sequence
    const syncedChapters: ChapterItem[] = [];
    newBooks.forEach((b) => {
      const bChaps = chapters.filter((c) => c.bookId === b.id);
      syncedChapters.push(...bChaps);
    });
    const knownBookIds = new Set(newBooks.map((b) => b.id));
    const orphans = chapters.filter((c) => !knownBookIds.has(c.bookId));
    syncedChapters.push(...orphans);

    setChapters(syncedChapters);
    setStatusText(`Порядок книг обновлен`);
  };

  // 4. One-touch Move Book Up/Down (for mobile touch screens)
  const handleMoveBook = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= books.length) return;

    const newBooks = [...books];
    const temp = newBooks[index];
    newBooks[index] = newBooks[targetIndex];
    newBooks[targetIndex] = temp;
    setBooks(newBooks);

    // Sync chapters
    const syncedChapters: ChapterItem[] = [];
    newBooks.forEach((b) => {
      const bChaps = chapters.filter((c) => c.bookId === b.id);
      syncedChapters.push(...bChaps);
    });
    const knownBookIds = new Set(newBooks.map((b) => b.id));
    const orphans = chapters.filter((c) => !knownBookIds.has(c.bookId));
    syncedChapters.push(...orphans);

    setChapters(syncedChapters);
  };

  // 5. Reorder Chapters (Drag & Drop)
  const handleReorderChapters = (draggedId: string, targetIdx: number) => {
    const sourceIdx = chapters.findIndex((c) => c.id === draggedId);
    if (sourceIdx === -1) return;

    const newChapters = [...chapters];
    const [movedChap] = newChapters.splice(sourceIdx, 1);
    newChapters.splice(targetIdx, 0, movedChap);
    setChapters(newChapters);
  };

  // 6. One-touch Move Chapter Up/Down (for mobile touch screens)
  const handleMoveChapter = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= chapters.length) return;

    const newChapters = [...chapters];
    const temp = newChapters[index];
    newChapters[index] = newChapters[targetIndex];
    newChapters[targetIndex] = temp;
    setChapters(newChapters);
  };

  // 7. Update Chapter Title Inline
  const handleUpdateChapterTitle = (id: string, newTitle: string) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)));
  };

  // 8. Checkbox Toggles
  const handleToggleChapterCheck = (id: string) => {
    setChapters((prev) => prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)));
  };

  const handleToggleSelectAll = () => {
    const allChecked = chapters.every((c) => c.checked);
    setChapters((prev) => prev.map((c) => ({ ...c, checked: !allChecked })));
  };

  // 9. View Chapter in Reader (switch to reader tab)
  const handleViewChapterInReader = (id: string) => {
    setSelectedChapterId(id);
    setActiveTab('preview');
  };

  // 10. Delete Book
  const handleDeleteBook = (bookId: string) => {
    const remainingBooks = books.filter((b) => b.id !== bookId);
    const remainingChapters = chapters.filter((c) => c.bookId !== bookId);
    setBooks(remainingBooks);
    setChapters(remainingChapters);
    if (selectedChapterId && !remainingChapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(remainingChapters[0]?.id || null);
    }
    setStatusText(`Книг: ${remainingBooks.length} | Глав: ${remainingChapters.length}`);
  };

  // 11. Delete Single Chapter
  const handleDeleteChapter = (chapId: string) => {
    const remainingChapters = chapters.filter((c) => c.id !== chapId);
    setChapters(remainingChapters);

    setBooks((prev) =>
      prev.map((b) => ({
        ...b,
        chapterCount: remainingChapters.filter((c) => c.bookId === b.id).length,
      }))
    );

    if (selectedChapterId === chapId) {
      setSelectedChapterId(remainingChapters[0]?.id || null);
    }
    setStatusText(`Книг: ${books.length} | Глав: ${remainingChapters.length}`);
  };

  // 12. Delete Checked Chapters
  const handleDeleteChecked = () => {
    const remainingChapters = chapters.filter((c) => !c.checked);
    setChapters(remainingChapters);

    setBooks((prev) =>
      prev.map((b) => ({
        ...b,
        chapterCount: remainingChapters.filter((c) => c.bookId === b.id).length,
      }))
    );

    if (selectedChapterId && !remainingChapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(remainingChapters[0]?.id || null);
    }
    setStatusText(`Удалены выбранные главы. Осталось: ${remainingChapters.length}`);
  };

  // 13. Smart Sort All
  const handleSortAll = () => {
    const sortedBooks = SmartSorter.sort<BookItem>(books);
    const sortedChapters: ChapterItem[] = [];

    sortedBooks.forEach((b) => {
      const bChaps = chapters.filter((c) => c.bookId === b.id);
      sortedChapters.push(...SmartSorter.sort<ChapterItem>(bChaps));
    });

    const knownIds = new Set(sortedBooks.map((b) => b.id));
    const orphans = chapters.filter((c) => !knownIds.has(c.bookId));
    sortedChapters.push(...SmartSorter.sort<ChapterItem>(orphans));

    setBooks(sortedBooks);
    setChapters(sortedChapters);
    setStatusText(`Все книги и главы отсортированы по номерам`);
  };

  // 14. Clear All
  const handleClearAll = () => {
    setBooks([]);
    setChapters([]);
    setSelectedChapterId(null);
    setStatusText('Список очищен');
  };

  // 15. Merge & Build
  const handleRunMerge = async () => {
    if (chapters.length === 0) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Предупреждение',
        message: 'Нет глав для сборки! Добавьте книги во вкладке «Список файлов» или нажмите «Демо».',
      });
      return;
    }

    setMergeProgress({ isMerging: true, currentStep: 'СБОРКА...', progressPercent: 20 });
    setStatusText('⏳ СБОРКА КНИГИ...');

    try {
      const result = await exportMergedBook(
        chapters,
        exportFormat,
        bookTitleOverride || 'MyMergedBook',
        (step) => {
          setStatusText(step);
          setMergeProgress((p) => ({ ...p, currentStep: step }));
        }
      );

      setMergeProgress({ isMerging: false, currentStep: '', progressPercent: 100 });
      setStatusText('Готово! ✔');

      setModal({
        isOpen: true,
        type: 'success',
        title: 'Успешная сборка!',
        message: result.message,
      });
    } catch (err: any) {
      setMergeProgress({ isMerging: false, currentStep: '', progressPercent: 0 });
      setStatusText('Ошибка сборки!');
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Ошибка при сборке книги',
        message: err.message || 'Произошла непредвиденная ошибка при компиляции электронной книги.',
      });
    }
  };

  const openFileDialog = () => {
    const input = document.getElementById('file-upload-input-global') as HTMLInputElement;
    if (input) input.click();
  };

  const checkedCount = chapters.filter((c) => c.checked).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col font-sans selection:bg-[#00fff5] selection:text-[#0a0a0f]">
      {/* Hidden global file input */}
      <input
        id="file-upload-input-global"
        type="file"
        multiple
        accept=".fb2,.epub,.docx,application/epub+zip,application/x-fictionbook+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) handleFilesSelected(e.target.files);
          e.target.value = '';
        }}
      />

      {/* 1. Top Section: Book Title, Export Settings, and Tabs (Список файлов / Список глав / Просмотр глав) */}
      <TopHeader
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        bookTitleOverride={bookTitleOverride}
        setBookTitleOverride={setBookTitleOverride}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        bookCount={books.length}
        chapterCount={chapters.length}
      />

      {/* 2. Center Main View: Full-space Tab Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-4 flex flex-col overflow-hidden">
        {activeTab === 'files' && (
          <div className="flex-1 min-h-[420px] flex flex-col">
            <LeftBooksPanel
              books={books}
              onReorderBooks={handleReorderBooks}
              onMoveBook={handleMoveBook}
              onDeleteBook={handleDeleteBook}
              onFilesSelected={handleFilesSelected}
              onLoadSamples={handleLoadSamples}
            />
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="flex-1 min-h-[420px] flex flex-col">
            <MiddleChaptersPanel
              chapters={chapters}
              selectedChapterId={selectedChapterId}
              onSelectChapter={setSelectedChapterId}
              onViewChapterInReader={handleViewChapterInReader}
              onReorderChapters={handleReorderChapters}
              onMoveChapter={handleMoveChapter}
              onUpdateChapterTitle={handleUpdateChapterTitle}
              onToggleChapterCheck={handleToggleChapterCheck}
              onToggleSelectAll={handleToggleSelectAll}
              onDeleteChapter={handleDeleteChapter}
            />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex-1 min-h-[420px] flex flex-col">
            <RightReaderPanel
              chapters={chapters}
              selectedChapterId={selectedChapterId}
              onSelectChapter={setSelectedChapterId}
            />
          </div>
        )}
      </main>

      {/* 3. Bottom Section: Mobile Action Toolbar with prominent СОБРАТЬ КНИГУ */}
      <BottomToolbar
        bookCount={books.length}
        chapterCount={chapters.length}
        checkedCount={checkedCount}
        statusText={statusText}
        mergeProgress={mergeProgress}
        onAddFiles={openFileDialog}
        onLoadSamples={handleLoadSamples}
        onSortAll={handleSortAll}
        onDeleteChecked={handleDeleteChecked}
        onClearAll={handleClearAll}
        onRunMerge={handleRunMerge}
      />

      {/* 4. Modal Alert Dialog */}
      <NotificationModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

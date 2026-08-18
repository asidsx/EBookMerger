import React, { useState } from 'react';
import { BookItem } from '../types/book';
import { UploadCloud, GripVertical, X, Plus, ChevronUp, ChevronDown, BookMarked } from 'lucide-react';

interface LeftBooksPanelProps {
  books: BookItem[];
  onReorderBooks: (draggedId: string, targetIdx: number) => void;
  onMoveBook: (index: number, direction: 'up' | 'down') => void;
  onDeleteBook: (id: string) => void;
  onFilesSelected: (files: FileList | File[]) => void;
  onLoadSamples: () => void;
}

export const LeftBooksPanel: React.FC<LeftBooksPanelProps> = ({
  books,
  onReorderBooks,
  onMoveBook,
  onDeleteBook,
  onFilesSelected,
  onLoadSamples,
}) => {
  const [draggedBookId, setDraggedBookId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragOverZone, setIsDragOverZone] = useState(false);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', `BOOK:${id}`);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedBookId(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDraggedBookId(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
      return;
    }

    const text = e.dataTransfer.getData('text/plain');
    if (text.startsWith('BOOK:')) {
      const bookId = text.replace('BOOK:', '');
      onReorderBooks(bookId, index);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
      e.target.value = '';
    }
  };

  const formatBadgeColor = (ext: string) => {
    switch (ext.toUpperCase()) {
      case 'FB2':
        return 'text-[#ff00ff] border-[#ff00ff]/30 bg-[#ff00ff]/10';
      case 'EPUB':
        return 'text-[#bc13fe] border-[#bc13fe]/30 bg-[#bc13fe]/10';
      case 'DOCX':
        return 'text-[#00fff5] border-[#00fff5]/30 bg-[#00fff5]/10';
      default:
        return 'text-zinc-400 border-zinc-700 bg-zinc-800';
    }
  };

  return (
    <div id="tab-content-files" className="flex flex-col h-full bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-3 sm:p-4 shadow-md">
      {/* Action Header inside Tab */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e1e30] gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-[#00fff5] flex items-center gap-1.5">
            <span>📁 СПИСОК ФАЙЛОВ КНИГ</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#1e1e30] text-[#00ff88] font-mono">
              {books.length}
            </span>
          </h2>
          <p className="text-[11px] text-[#8888aa] hidden sm:block">
            Порядок файлов определяет структуру результирующей книги
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label
            htmlFor="file-upload-input-panel"
            className="cursor-pointer text-xs font-bold text-[#0a0a0f] bg-[#00fff5] hover:bg-[#00ff88] active:scale-95 flex items-center space-x-1 px-3 py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(0,255,245,0.3)]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Добавить</span>
          </label>
          <input
            id="file-upload-input-panel"
            type="file"
            multiple
            accept=".fb2,.epub,.docx,application/epub+zip,application/x-fictionbook+xml"
            className="hidden"
            onChange={handleFileInputChange}
          />
        </div>
      </div>

      {/* Book list container */}
      <div
        className={`flex-1 overflow-y-auto mt-3 space-y-2 pr-1 min-h-[300px] transition-colors rounded-lg ${
          isDragOverZone ? 'bg-[#12121d] border-2 border-dashed border-[#00fff5]' : ''
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOverZone(true);
        }}
        onDragLeave={() => setIsDragOverZone(false)}
        onDrop={(e) => {
          setIsDragOverZone(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            e.preventDefault();
            onFilesSelected(e.dataTransfer.files);
          }
        }}
      >
        {books.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
            <UploadCloud className="w-12 h-12 text-[#00fff5]/40 mb-3 animate-pulse" />
            <p className="text-sm font-bold text-white mb-1">Файлы книг ещё не добавлены</p>
            <p className="text-xs text-[#8888aa] mb-4 max-w-sm">
              Нажмите кнопку «+ Добавить» или загрузите готовые демонстрационные книги
            </p>
            <button
              onClick={onLoadSamples}
              className="px-4 py-2 bg-[#1a1a28] hover:bg-[#252538] text-[#00fff5] border border-[#00fff5]/40 rounded-lg text-xs font-bold flex items-center space-x-2 transition-all active:scale-95 shadow-xs"
            >
              <BookMarked className="w-4 h-4" />
              <span>Загрузить 3 демо-книги</span>
            </button>
          </div>
        ) : (
          books.map((book, idx) => (
            <React.Fragment key={book.id}>
              {/* Drop indicator before item */}
              {dragOverIndex === idx && draggedBookId !== book.id && (
                <div className="h-1 bg-[#00fff5] rounded-full shadow-[0_0_8px_#00fff5] my-1 animate-pulse" />
              )}

              <div
                id={`book-card-${book.id}`}
                draggable
                onDragStart={(e) => handleDragStart(e, book.id)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                className={`group flex items-center justify-between p-3 rounded-xl border bg-[#12121d] transition-all ${
                  draggedBookId === book.id
                    ? 'opacity-40 border-[#00fff5]'
                    : 'border-[#1e1e30] hover:border-[#00fff5]/60 hover:shadow-[0_0_12px_rgba(0,255,245,0.15)]'
                }`}
              >
                <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                  {/* Position number on phone */}
                  <span className="text-[11px] font-mono text-[#8888aa] w-5 text-center font-bold">
                    {idx + 1}
                  </span>

                  {/* Format badge */}
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${formatBadgeColor(
                      book.ext
                    )}`}
                  >
                    [{book.ext}]
                  </span>

                  {/* Book title */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-[#00fff5] transition-colors"
                      title={book.name}
                    >
                      {book.name}
                    </span>
                    <span className="text-[10px] text-[#8888aa] truncate">{book.fileName}</span>
                  </div>
                </div>

                {/* Controls: Up/Down reordering for mobile touch + Chapter count + Delete */}
                <div className="flex items-center space-x-1.5 ml-2">
                  {/* Chapter count badge */}
                  <span className="text-[11px] font-mono text-[#00ff88] bg-[#1a2a22] border border-[#00ff88]/30 px-2 py-0.5 rounded font-bold">
                    {book.chapterCount} гл.
                  </span>

                  {/* Touch Up/Down buttons for mobile */}
                  <div className="flex flex-col">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => onMoveBook(idx, 'up')}
                      className="p-1 text-zinc-400 hover:text-[#00fff5] disabled:opacity-20 disabled:hover:text-zinc-400 active:scale-90"
                      title="Переместить выше"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === books.length - 1}
                      onClick={() => onMoveBook(idx, 'down')}
                      className="p-1 text-zinc-400 hover:text-[#00fff5] disabled:opacity-20 disabled:hover:text-zinc-400 active:scale-90"
                      title="Переместить ниже"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    id={`btn-del-book-${book.id}`}
                    type="button"
                    onClick={() => onDeleteBook(book.id)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#ff3344] transition-all active:scale-90"
                    title="Удалить книгу"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </React.Fragment>
          ))
        )}

        {/* Drop indicator at end */}
        {dragOverIndex === books.length && (
          <div className="h-1 bg-[#00fff5] rounded-full shadow-[0_0_8px_#00fff5] my-1 animate-pulse" />
        )}
      </div>
    </div>
  );
};

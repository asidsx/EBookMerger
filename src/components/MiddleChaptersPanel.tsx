import React, { useState } from 'react';
import { ChapterItem } from '../types/book';
import { GripVertical, X, CheckSquare, Square, Eye, ChevronUp, ChevronDown } from 'lucide-react';

interface MiddleChaptersPanelProps {
  chapters: ChapterItem[];
  selectedChapterId: string | null;
  onSelectChapter: (id: string) => void;
  onViewChapterInReader: (id: string) => void;
  onReorderChapters: (draggedId: string, targetIdx: number) => void;
  onMoveChapter: (index: number, direction: 'up' | 'down') => void;
  onUpdateChapterTitle: (id: string, newTitle: string) => void;
  onToggleChapterCheck: (id: string) => void;
  onToggleSelectAll: () => void;
  onDeleteChapter: (id: string) => void;
}

export const MiddleChaptersPanel: React.FC<MiddleChaptersPanelProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onViewChapterInReader,
  onReorderChapters,
  onMoveChapter,
  onUpdateChapterTitle,
  onToggleChapterCheck,
  onToggleSelectAll,
  onDeleteChapter,
}) => {
  const [draggedChapId, setDraggedChapId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', `CHAP:${id}`);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedChapId(id);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    setDraggedChapId(null);

    const text = e.dataTransfer.getData('text/plain');
    if (text.startsWith('CHAP:')) {
      const chapId = text.replace('CHAP:', '');
      onReorderChapters(chapId, index);
    }
  };

  const allChecked = chapters.length > 0 && chapters.every((c) => c.checked);
  const checkedCount = chapters.filter((c) => c.checked).length;

  return (
    <div id="tab-content-chapters" className="flex flex-col h-full bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-3 sm:p-4 shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e1e30] gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-wide text-[#bc13fe] flex items-center gap-1.5">
            <span>📑 СПИСОК ГЛАВ (НА ВЫХОД)</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#1e1e30] text-[#bc13fe] font-mono">
              {chapters.length}
            </span>
          </h2>
          <p className="text-[11px] text-[#8888aa] hidden sm:block">
            Редактируйте названия и порядок следования глав в готовой книге
          </p>
        </div>

        {chapters.length > 0 && (
          <button
            id="btn-toggle-select-all"
            type="button"
            onClick={onToggleSelectAll}
            className="text-xs font-semibold text-[#8888aa] hover:text-white flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1a1a28] hover:bg-[#252538] transition-colors active:scale-95"
          >
            {allChecked ? (
              <CheckSquare className="w-4 h-4 text-[#00fff5]" />
            ) : (
              <Square className="w-4 h-4 text-zinc-500" />
            )}
            <span>{checkedCount > 0 ? `Выбрано: ${checkedCount}` : 'Выбрать все'}</span>
          </button>
        )}
      </div>

      {/* Chapters list */}
      <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 min-h-[300px]">
        {chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-[#8888aa]">
            <p className="text-sm font-bold text-white mb-1">Список глав пуст</p>
            <p className="text-xs text-zinc-500">Добавьте файлы книг во вкладке «Список файлов»</p>
          </div>
        ) : (
          chapters.map((chap, idx) => {
            const isSelected = selectedChapterId === chap.id;
            const nextChap = chapters[idx + 1];
            const isBookBoundary = nextChap && nextChap.bookId !== chap.bookId;

            return (
              <React.Fragment key={chap.id}>
                {/* Drag over indicator */}
                {dragOverIndex === idx && draggedChapId !== chap.id && (
                  <div className="h-1 bg-[#bc13fe] rounded-full shadow-[0_0_8px_#bc13fe] my-1 animate-pulse" />
                )}

                <div
                  id={`chap-card-${chap.id}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, chap.id)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onClick={() => onSelectChapter(chap.id)}
                  className={`group flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl border transition-all gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#1a162b] border-[#bc13fe] shadow-[0_0_12px_rgba(188,19,254,0.25)]'
                      : 'bg-[#161621] border-[#232336] hover:border-[#bc13fe]/60'
                  } ${draggedChapId === chap.id ? 'opacity-40' : ''}`}
                >
                  {/* Left part: checkbox, number, source, title */}
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={chap.checked}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleChapterCheck(chap.id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded bg-[#0a0a0f] border-[#2a2a40] text-[#00fff5] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#00fff5] shrink-0"
                    />

                    {/* Chapter index */}
                    <span className="text-[11px] font-mono font-bold text-zinc-500 w-4 text-center shrink-0">
                      {idx + 1}
                    </span>

                    {/* Source Book Tag */}
                    <span
                      className="text-[10px] font-bold text-[#8888aa] truncate max-w-[85px] sm:max-w-[120px] bg-[#0a0a0f] px-1.5 py-0.5 rounded border border-[#2a2a40] shrink-0"
                      title={`Источник: ${chap.bookName}`}
                    >
                      [{chap.bookName}]
                    </span>

                    {/* Editable Title Input */}
                    <input
                      type="text"
                      value={chap.title}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onUpdateChapterTitle(chap.id, e.target.value)}
                      placeholder="Название главы..."
                      className="flex-1 text-xs sm:text-sm font-semibold text-[#00fff5] bg-[#0a0a0f] border border-[#2a2a40] focus:border-[#00ff88] rounded-lg px-2.5 py-1.5 min-w-[120px] transition-colors focus:outline-none"
                    />
                  </div>

                  {/* Right part: Mobile Reorder (Up/Down) + Read Preview button + Delete */}
                  <div className="flex items-center justify-end space-x-1.5 pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                    {/* Mobile touch Up/Down buttons */}
                    <div className="flex items-center bg-[#0a0a0f] rounded-lg border border-[#2a2a40] p-0.5">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveChapter(idx, 'up');
                        }}
                        className="p-1 text-zinc-400 hover:text-[#bc13fe] disabled:opacity-20 active:scale-90"
                        title="Переместить главу выше"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === chapters.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveChapter(idx, 'down');
                        }}
                        className="p-1 text-zinc-400 hover:text-[#bc13fe] disabled:opacity-20 active:scale-90"
                        title="Переместить главу ниже"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Open in Reader Tab Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewChapterInReader(chap.id);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#1a1a28] hover:bg-[#252538] text-[#00ff88] text-xs font-bold flex items-center space-x-1 transition-all active:scale-95"
                      title="Читать эту главу"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Читать</span>
                    </button>

                    {/* Delete Chapter */}
                    <button
                      id={`btn-del-chap-${chap.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChapter(chap.id);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-[#ff3344] transition-all active:scale-90"
                      title="Удалить главу"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* RED BOOK BOUNDARY DIVIDER */}
                {isBookBoundary && (
                  <div className="flex items-center space-x-2 py-2 px-1 my-1">
                    <div className="h-[2px] flex-1 bg-[#ff3344] opacity-80" />
                    <span className="text-[10px] font-bold tracking-wider text-[#ff4455] uppercase whitespace-nowrap">
                      ── Конец файла: {chap.bookName} ──
                    </span>
                    <div className="h-[2px] flex-1 bg-[#ff3344] opacity-80" />
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}

        {/* Drag over indicator at end */}
        {dragOverIndex === chapters.length && (
          <div className="h-1 bg-[#bc13fe] rounded-full shadow-[0_0_8px_#bc13fe] my-1 animate-pulse" />
        )}
      </div>
    </div>
  );
};

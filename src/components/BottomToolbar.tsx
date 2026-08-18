import React from 'react';
import { Plus, ArrowUpDown, Trash2, RotateCcw, Download, BookMarked, Loader2 } from 'lucide-react';
import { MergeProgress } from '../types/book';

interface BottomToolbarProps {
  bookCount: number;
  chapterCount: number;
  checkedCount: number;
  statusText: string;
  mergeProgress: MergeProgress;
  onAddFiles: () => void;
  onLoadSamples: () => void;
  onSortAll: () => void;
  onDeleteChecked: () => void;
  onClearAll: () => void;
  onRunMerge: () => void;
}

export const BottomToolbar: React.FC<BottomToolbarProps> = ({
  bookCount,
  chapterCount,
  checkedCount,
  statusText,
  mergeProgress,
  onAddFiles,
  onLoadSamples,
  onSortAll,
  onDeleteChecked,
  onClearAll,
  onRunMerge,
}) => {
  return (
    <footer id="main-mobile-bottom-toolbar" className="bg-[#0a0a0f] border-t border-[#1e1e30] sticky bottom-0 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.7)] px-3 py-2.5 sm:px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-2.5">
        {/* Status Bar */}
        <div className="flex items-center justify-between text-[11px] text-[#8888aa] px-1 font-mono">
          <div className="flex items-center space-x-1.5 truncate">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shrink-0" />
            <span className="truncate">{statusText}</span>
          </div>
          <span className="text-[#00fff5] shrink-0 font-bold">
            {bookCount} кн. / {chapterCount} гл.
          </span>
        </div>

        {/* Main Action Bar: Primary Assemble Button + Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2">
          {/* Prominent Assemble Button */}
          <button
            id="btn-run-merge-mobile"
            type="button"
            onClick={onRunMerge}
            disabled={chapterCount === 0 || mergeProgress.isMerging}
            className="flex-1 py-3 px-4 rounded-xl bg-[#00ff88] hover:bg-[#00fff5] active:scale-98 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-[#0a0a0f] text-sm sm:text-base font-black uppercase tracking-wider transition-all duration-200 flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(0,255,136,0.35)] hover:shadow-[0_0_25px_rgba(0,255,245,0.5)] cursor-pointer"
          >
            {mergeProgress.isMerging ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-[#0a0a0f]" />
                <span className="truncate">{mergeProgress.currentStep || 'СБОРКА...'}</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>СОБРАТЬ КНИГУ</span>
              </>
            )}
          </button>

          {/* Quick Tools Buttons Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 scrollbar-none">
            {/* Add Books */}
            <button
              id="btn-quick-add"
              type="button"
              onClick={onAddFiles}
              className="px-3 py-2.5 rounded-lg bg-[#2a2a40] hover:bg-[#3f3f5a] text-white text-xs font-bold transition-all flex items-center space-x-1 shrink-0 active:scale-95 border border-[#3a3a52]"
              title="Добавить книги"
            >
              <Plus className="w-3.5 h-3.5 text-[#00fff5]" />
              <span className="hidden xs:inline">+ Файлы</span>
            </button>

            {/* Smart Sort */}
            <button
              id="btn-quick-sort"
              type="button"
              onClick={onSortAll}
              disabled={chapterCount === 0}
              className="px-3 py-2.5 rounded-lg bg-[#2a2a40] hover:bg-[#3f3f5a] disabled:opacity-30 text-white text-xs font-bold transition-all flex items-center space-x-1 shrink-0 active:scale-95 border border-[#3a3a52]"
              title="Сортировать книги и главы по номерам"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00ff88]" />
              <span>Сортировать</span>
            </button>

            {/* Delete Selected */}
            <button
              id="btn-quick-delete-checked"
              type="button"
              onClick={onDeleteChecked}
              disabled={checkedCount === 0}
              className="px-3 py-2.5 rounded-lg bg-[#2a2a40] hover:bg-rose-950 hover:text-rose-300 disabled:opacity-30 text-zinc-300 text-xs font-bold transition-all flex items-center space-x-1 shrink-0 active:scale-95 border border-[#3a3a52]"
              title="Удалить выбранные чекбоксами главы"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Удалить {checkedCount > 0 ? `(${checkedCount})` : ''}</span>
            </button>

            {/* Demo Books */}
            <button
              id="btn-quick-demo"
              type="button"
              onClick={onLoadSamples}
              className="px-3 py-2.5 rounded-lg bg-[#1a1a28] hover:bg-[#252538] text-[#00fff5] border border-[#00fff5]/30 text-xs font-semibold transition-all flex items-center space-x-1 shrink-0 active:scale-95"
              title="Загрузить готовые примеры"
            >
              <BookMarked className="w-3.5 h-3.5" />
              <span>Демо</span>
            </button>

            {/* Clear All */}
            <button
              id="btn-quick-clear"
              type="button"
              onClick={onClearAll}
              disabled={bookCount === 0 && chapterCount === 0}
              className="px-2.5 py-2.5 rounded-lg bg-[#1a1a28] hover:bg-[#252538] disabled:opacity-30 text-zinc-400 hover:text-white text-xs font-semibold transition-all flex items-center shrink-0 active:scale-95"
              title="Сбросить всё"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

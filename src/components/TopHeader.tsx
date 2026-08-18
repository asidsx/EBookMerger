import React from 'react';
import { ExportFormat, ActiveTab } from '../types/book';
import { BookOpen, FolderArchive, ListOrdered, Eye, Edit3 } from 'lucide-react';

interface TopHeaderProps {
  exportFormat: ExportFormat;
  setExportFormat: (fmt: ExportFormat) => void;
  bookTitleOverride: string;
  setBookTitleOverride: (title: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  bookCount: number;
  chapterCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  exportFormat,
  setExportFormat,
  bookTitleOverride,
  setBookTitleOverride,
  activeTab,
  setActiveTab,
  bookCount,
  chapterCount,
}) => {
  return (
    <header id="main-mobile-header" className="bg-[#0a0a0f] border-b border-[#1e1e30] sticky top-0 z-30 shadow-lg">
      {/* 1. Top Settings Bar: Title & Output Configuration */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 pt-3 pb-2.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Book Title Input */}
          <div className="flex items-center space-x-2 bg-[#12121d] border border-[#2a2a40] rounded-lg px-3 py-2 flex-1 focus-within:border-[#00fff5] transition-colors shadow-xs">
            <Edit3 className="w-4 h-4 text-[#00fff5] shrink-0" />
            <div className="flex flex-col min-w-0 flex-1">
              <label htmlFor="input-book-title-override" className="text-[10px] uppercase font-bold text-[#8888aa] tracking-wider leading-none mb-0.5">
                Название книги:
              </label>
              <input
                id="input-book-title-override"
                type="text"
                value={bookTitleOverride}
                onChange={(e) => setBookTitleOverride(e.target.value)}
                placeholder="Введите название итоговой книги..."
                className="bg-transparent text-xs sm:text-sm text-[#00fff5] font-bold placeholder-zinc-600 focus:outline-none w-full truncate"
              />
            </div>
          </div>

          {/* Export Format Selector (Настройка выхода) */}
          <div className="flex items-center justify-between sm:justify-start space-x-1.5 bg-[#12121d] border border-[#2a2a40] p-1.5 rounded-lg shrink-0">
            <span className="text-[11px] font-bold text-[#8888aa] px-1.5 hidden md:inline">
              Выход:
            </span>

            <button
              id="tab-format-fb2"
              type="button"
              onClick={() => setExportFormat('fb2')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                exportFormat === 'fb2'
                  ? 'bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff] shadow-[0_0_8px_rgba(255,0,255,0.4)]'
                  : 'text-zinc-400 hover:text-[#ff00ff] hover:bg-[#1a1a28]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${exportFormat === 'fb2' ? 'bg-[#ff00ff]' : 'border border-zinc-500'}`} />
              <span>FB2</span>
            </button>

            <button
              id="tab-format-epub"
              type="button"
              onClick={() => setExportFormat('epub')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                exportFormat === 'epub'
                  ? 'bg-[#bc13fe]/20 text-[#bc13fe] border border-[#bc13fe] shadow-[0_0_8px_rgba(188,19,254,0.4)]'
                  : 'text-zinc-400 hover:text-[#bc13fe] hover:bg-[#1a1a28]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${exportFormat === 'epub' ? 'bg-[#bc13fe]' : 'border border-zinc-500'}`} />
              <span>EPUB</span>
            </button>

            <button
              id="tab-format-both"
              type="button"
              onClick={() => setExportFormat('both')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                exportFormat === 'both'
                  ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.4)]'
                  : 'text-zinc-400 hover:text-[#00ff88] hover:bg-[#1a1a28]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${exportFormat === 'both' ? 'bg-[#00ff88]' : 'border border-zinc-500'}`} />
              <span>ОБА</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Mobile Tabs (Вкладки: Список файлов, Список глав, Просмотр глав) */}
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <nav className="grid grid-cols-3 gap-1 p-1 bg-[#12121d] border border-[#232336] rounded-xl mb-2">
          {/* Tab 1: Список файлов */}
          <button
            id="tab-nav-files"
            type="button"
            onClick={() => setActiveTab('files')}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all relative ${
              activeTab === 'files'
                ? 'bg-[#00fff5] text-[#0a0a0f] shadow-[0_0_12px_rgba(0,255,245,0.4)] font-black'
                : 'text-zinc-400 hover:text-[#00fff5] hover:bg-[#1a1a28]'
            }`}
          >
            <FolderArchive className="w-4 h-4 shrink-0" />
            <span className="truncate">Список файлов</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'files' ? 'bg-[#0a0a0f] text-[#00fff5]' : 'bg-[#1e1e30] text-[#00fff5]'
              }`}
            >
              {bookCount}
            </span>
          </button>

          {/* Tab 2: Список глав */}
          <button
            id="tab-nav-chapters"
            type="button"
            onClick={() => setActiveTab('chapters')}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all relative ${
              activeTab === 'chapters'
                ? 'bg-[#bc13fe] text-white shadow-[0_0_12px_rgba(188,19,254,0.4)] font-black'
                : 'text-zinc-400 hover:text-[#bc13fe] hover:bg-[#1a1a28]'
            }`}
          >
            <ListOrdered className="w-4 h-4 shrink-0" />
            <span className="truncate">Список глав</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'chapters' ? 'bg-[#0a0a0f] text-[#bc13fe]' : 'bg-[#1e1e30] text-[#bc13fe]'
              }`}
            >
              {chapterCount}
            </span>
          </button>

          {/* Tab 3: Просмотр глав */}
          <button
            id="tab-nav-preview"
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all relative ${
              activeTab === 'preview'
                ? 'bg-[#00ff88] text-[#0a0a0f] shadow-[0_0_12px_rgba(0,255,136,0.4)] font-black'
                : 'text-zinc-400 hover:text-[#00ff88] hover:bg-[#1a1a28]'
            }`}
          >
            <Eye className="w-4 h-4 shrink-0" />
            <span className="truncate">Просмотр глав</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

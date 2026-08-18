import React, { useState } from 'react';
import { ChapterItem } from '../types/book';
import { BookOpen, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface RightReaderPanelProps {
  chapters: ChapterItem[];
  selectedChapterId: string | null;
  onSelectChapter: (id: string) => void;
}

export const RightReaderPanel: React.FC<RightReaderPanelProps> = ({
  chapters,
  selectedChapterId,
  onSelectChapter,
}) => {
  const [fontSize, setFontSize] = useState<number>(16);
  const [readerTheme, setReaderTheme] = useState<'cyber' | 'sepia' | 'dark'>('cyber');

  const currentIndex = chapters.findIndex((c) => c.id === selectedChapterId);
  const currentChapter = chapters[currentIndex] || chapters[0] || null;

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectChapter(chapters[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < chapters.length - 1) {
      onSelectChapter(chapters[currentIndex + 1].id);
    }
  };

  const readingTimeMin = currentChapter
    ? Math.max(1, Math.ceil(currentChapter.wordCount / 180))
    : 0;

  const getThemeClass = () => {
    switch (readerTheme) {
      case 'sepia':
        return 'bg-[#241f1c] text-[#f4ecd8] border-[#3d322a]';
      case 'dark':
        return 'bg-[#000000] text-[#e0e0e0] border-[#222222]';
      case 'cyber':
      default:
        return 'bg-[#0a0a0f] text-[#f0f0f5] border-[#2a2a40]';
    }
  };

  return (
    <div id="tab-content-preview" className="flex flex-col h-full bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-3 sm:p-4 shadow-md">
      {/* 1. Reader Controls Topbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pb-3 border-b border-[#1e1e30] gap-2.5">
        {/* Chapter Quick Switcher Dropdown for Mobile */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <BookOpen className="w-4 h-4 text-[#00ff88] shrink-0" />
          <select
            id="select-active-chapter"
            value={currentChapter?.id || ''}
            onChange={(e) => onSelectChapter(e.target.value)}
            className="bg-[#12121d] border border-[#2a2a40] text-xs font-bold text-[#00fff5] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#00ff88] w-full max-w-xs truncate"
          >
            {chapters.map((chap, idx) => (
              <option key={chap.id} value={chap.id}>
                {idx + 1}. {chap.title} ({chap.bookName})
              </option>
            ))}
          </select>
        </div>

        {/* Reader Display Controls */}
        <div className="flex items-center justify-between sm:justify-end space-x-2">
          {/* Theme switcher */}
          <div className="flex bg-[#12121d] border border-[#2a2a40] rounded-lg p-0.5 text-[11px]">
            <button
              onClick={() => setReaderTheme('cyber')}
              className={`px-2 py-1 rounded transition-colors font-semibold ${
                readerTheme === 'cyber' ? 'bg-[#00fff5]/20 text-[#00fff5]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Cyber
            </button>
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`px-2 py-1 rounded transition-colors font-semibold ${
                readerTheme === 'sepia' ? 'bg-[#d2b48c]/20 text-[#e0c4a4]' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sepia
            </button>
            <button
              onClick={() => setReaderTheme('dark')}
              className={`px-2 py-1 rounded transition-colors font-semibold ${
                readerTheme === 'dark' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Dark
            </button>
          </div>

          {/* Font size adjustment */}
          <div className="flex items-center space-x-1 bg-[#12121d] border border-[#2a2a40] rounded-lg p-1">
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="p-1 rounded text-zinc-400 hover:text-white active:scale-90"
              title="Уменьшить шрифт"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-1 font-bold text-zinc-300">{fontSize}px</span>
            <button
              onClick={() => setFontSize((s) => Math.min(26, s + 1))}
              className="p-1 rounded text-zinc-400 hover:text-white active:scale-90"
              title="Увеличить шрифт"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Reader Content Viewport */}
      <div className="flex-1 overflow-y-auto mt-3 rounded-xl border border-[#1e1e30] p-4 sm:p-6 bg-[#0a0a0f] min-h-[300px]">
        {!currentChapter ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-[#8888aa] py-16">
            <BookOpen className="w-12 h-12 text-zinc-700 mb-3" />
            <h3 className="text-sm font-bold text-zinc-400">
              Нет выбранной главы
            </h3>
            <p className="text-xs text-zinc-600 mt-1 max-w-xs">
              Добавьте книги или перейдите во вкладку «Список глав»
            </p>
          </div>
        ) : (
          <div className={`rounded-xl p-4 sm:p-6 transition-colors shadow-inner ${getThemeClass()}`}>
            {/* Chapter Header */}
            <div className="border-b border-zinc-700/50 pb-4 mb-5 text-center">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-[#8888aa] block mb-1">
                Книга: {currentChapter.bookName}
              </span>
              <h2 className="text-lg sm:text-2xl font-bold text-[#00fff5] leading-snug">
                {currentChapter.title}
              </h2>
              <div className="flex items-center justify-center space-x-3 mt-2 text-[11px] text-[#8888aa] font-mono">
                <span>{currentChapter.wordCount} слов</span>
                <span>•</span>
                <span>~{readingTimeMin} мин чтения</span>
              </div>
            </div>

            {/* Paragraphs */}
            <div
              className="space-y-4 font-serif leading-relaxed"
              style={{ fontSize: `${fontSize}px` }}
            >
              {currentChapter.paragraphs.map((para, pIdx) => {
                const trimmed = para.trim();

                if (!trimmed) {
                  return <div key={pIdx} className="h-3" />;
                }

                if (trimmed.startsWith('### ')) {
                  return (
                    <h3
                      key={pIdx}
                      className="text-base sm:text-lg font-sans font-bold text-[#00ff88] mt-6 mb-2 not-italic"
                    >
                      {trimmed.replace(/^###\s*/, '')}
                    </h3>
                  );
                }

                const imgMatch = trimmed.match(/^\[IMG:([^\]]+)\]$/);
                if (imgMatch) {
                  const imgId = imgMatch[1];
                  const imgData = currentChapter.images[imgId];
                  return (
                    <div key={pIdx} className="my-5 flex flex-col items-center justify-center">
                      {imgData ? (
                        <div className="p-1.5 rounded-xl border border-[#2a2a40] bg-[#12121d] max-w-full shadow-lg">
                          <img
                            src={imgData.data}
                            alt="Chapter illustration"
                            className="max-h-80 w-auto object-contain rounded-lg"
                          />
                          <span className="text-[10px] font-mono text-center block text-[#8888aa] mt-1.5">
                            Встроенная иллюстрация ({imgId})
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-xs text-zinc-500 bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                          <ImageIcon className="w-4 h-4" />
                          <span>[Иллюстрация: {imgId}]</span>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <p key={pIdx} className="indent-6 sm:indent-8 text-justify">
                    {trimmed}
                  </p>
                );
              })}
            </div>

            {/* End of chapter marker and mobile Prev/Next Navigation */}
            <div className="mt-10 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                disabled={currentIndex <= 0}
                onClick={handlePrev}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#161621] hover:bg-[#232336] text-white disabled:opacity-20 disabled:hover:bg-[#161621] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-95 border border-[#2a2a40]"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Предыдущая глава</span>
              </button>

              <span className="text-xs text-[#8888aa] font-mono">
                {currentIndex + 1} из {chapters.length}
              </span>

              <button
                type="button"
                disabled={currentIndex >= chapters.length - 1}
                onClick={handleNext}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#161621] hover:bg-[#232336] text-white disabled:opacity-20 disabled:hover:bg-[#161621] text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-95 border border-[#2a2a40]"
              >
                <span>Следующая глава</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

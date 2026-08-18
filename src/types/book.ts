export type BookFormat = 'FB2' | 'EPUB' | 'DOCX';
export type ExportFormat = 'fb2' | 'epub' | 'both';
export type ActiveTab = 'files' | 'chapters' | 'preview';

export interface BookImage {
  id: string;
  data: string; // base64 or data URI
  type: string; // e.g. 'image/jpeg', 'image/png'
  fileName?: string;
}

export interface ChapterItem {
  id: string;
  bookId: string;
  bookName: string;
  title: string;
  paragraphs: string[];
  images: Record<string, BookImage>;
  checked: boolean;
  wordCount: number;
}

export interface BookItem {
  id: string;
  name: string;
  fileName: string;
  ext: BookFormat;
  sizeBytes: number;
  chapterCount: number;
}

export interface MergeProgress {
  isMerging: boolean;
  currentStep: string;
  progressPercent: number;
}

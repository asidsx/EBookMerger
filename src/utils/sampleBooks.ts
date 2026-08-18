import { BookItem, ChapterItem } from '../types/book';

// Minimal inline SVG illustration data URL for fantasy/tech cover
const SAMPLE_COVER_IMAGE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%230a0a14"/><stop offset="50%" stop-color="%231e1338"/><stop offset="100%" stop-color="%2300fff5"/></linearGradient></defs><rect width="600" height="400" fill="url(%23g)" rx="12"/><circle cx="300" cy="180" r="70" fill="%23bc13fe" opacity="0.3"/><polygon points="300,120 360,240 240,240" fill="none" stroke="%2300fff5" stroke-width="3"/><text x="300" y="320" font-family="sans-serif" font-size="22" font-weight="bold" fill="%23ffffff" text-anchor="middle">ХРОНИКИ ЗАБЫТЫХ МИРОВ</text><text x="300" y="350" font-family="sans-serif" font-size="14" fill="%2300ff88" text-anchor="middle">Иллюстрация артефакта древней эпохи</text></svg>`;

export function getSampleBooks(): { books: BookItem[]; chapters: ChapterItem[] } {
  const book1Id = 'sample-book-1';
  const book2Id = 'sample-book-2';
  const book3Id = 'sample-book-3';

  const books: BookItem[] = [
    {
      id: book1Id,
      name: 'Хроники Забытых Миров. Том 1',
      fileName: 'Chronicles_Vol1.fb2',
      ext: 'FB2',
      sizeBytes: 142800,
      chapterCount: 3,
    },
    {
      id: book2Id,
      name: 'Хроники Забытых Миров. Том 2',
      fileName: 'Chronicles_Vol2.epub',
      ext: 'EPUB',
      sizeBytes: 195400,
      chapterCount: 3,
    },
    {
      id: book3Id,
      name: 'Архивы Древней Цитадели (Дополнение)',
      fileName: 'Citadel_Archives.docx',
      ext: 'DOCX',
      sizeBytes: 88200,
      chapterCount: 2,
    },
  ];

  const chapters: ChapterItem[] = [
    // Book 1 chapters
    {
      id: 'chap-1-1',
      bookId: book1Id,
      bookName: 'Хроники Забытых Миров. Том 1',
      title: 'Глава 1. Пробуждение на краю Бездны',
      paragraphs: [
        'Небо над долиной Элизиума озарилось фиолетовым заревом, когда древние маяки вновь наполнились энергией.',
        'Эриан поднял взгляд к небесным монолитам. Ветер приносил с гор запах озона и расплавленного кремния.',
        '[IMG:sample_img_1]',
        '— Мы не успеем до захода солнца, — тихо произнесла Лира, сверяясь с кристаллическим хронометром на запястье. — Барьер закроется через сорок минут.',
        'Они ускорили шаг по каменной тропе, петляющей между гигантскими обелисками предков.',
      ],
      images: {
        sample_img_1: {
          id: 'sample_img_1',
          data: SAMPLE_COVER_IMAGE,
          type: 'image/svg+xml',
        },
      },
      checked: false,
      wordCount: 56,
    },
    {
      id: 'chap-1-2',
      bookId: book1Id,
      bookName: 'Хроники Забытых Миров. Том 1',
      title: 'Глава 2. Тайны Седьмого Портала',
      paragraphs: [
        'Врата гудели низким басовым тоном, резонируя в самой груди путешественников.',
        '### Рунические знаки на арке',
        'На внешней дуге вращались шестерни из звездного металла, покрытые выгравированными глифами ушедшей эпохи.',
        'Эриан прикоснулся перчаткой к центральному замку. Металл отозвался волной мягкого бирюзового света, пронесшейся по всей стене цитадели.',
      ],
      images: {},
      checked: false,
      wordCount: 42,
    },
    {
      id: 'chap-1-3',
      bookId: book1Id,
      bookName: 'Хроники Забытых Миров. Том 1',
      title: 'Глава 3. Зов Безмолвного Океана',
      paragraphs: [
        'За вратами открывался вид на бескрайнюю водную гладь, отражавшую три луны мира Кеплер-9.',
        'Ни единой волны не нарушало зеркальную поверхность. Вода казалась жидким сапфиром, хранящим память о тысячах исчезнувших цивилизаций.',
        '— Вот оно, начало великого пути, — прошептала Лира.',
      ],
      images: {},
      checked: false,
      wordCount: 38,
    },

    // Book 2 chapters
    {
      id: 'chap-2-1',
      bookId: book2Id,
      bookName: 'Хроники Забытых Миров. Том 2',
      title: 'Глава 4. Шепот Забытых Звезд',
      paragraphs: [
        'Второй переход оказался куда суровее первого. Воздух в подземном лабиринте был разреженным и холодным.',
        'Каждый шаг отдавался звонким эхом под сводами из темного обсидиана.',
        '### Предупреждение хранителей',
        'На каменных табличках вдоль прохода четко читалось предупреждение: «Не нарушай покой спящих машин, ибо сон их держит небосвод».',
      ],
      images: {},
      checked: false,
      wordCount: 47,
    },
    {
      id: 'chap-2-2',
      bookId: book2Id,
      bookName: 'Хроники Забытых Миров. Том 2',
      title: 'Глава 5. Сердце Хроноса',
      paragraphs: [
        'В центре огромного зала парил сферический реактор размером с трехэтажный дом.',
        'Внутри сферы бились дуги чистой хроно-энергии, замедляя и ускоряя пылинки в воздухе вокруг себя.',
        'Эриан понял, что именно этот механизм контролировал течение времени в закрытой долине.',
      ],
      images: {},
      checked: false,
      wordCount: 41,
    },
    {
      id: 'chap-2-3',
      bookId: book2Id,
      bookName: 'Хроники Забытых Миров. Том 2',
      title: 'Эпилог. Новый Горизонт',
      paragraphs: [
        'Когда ключ повернулся в замке, небо над миром вновь обрело свой естественный лазурный цвет.',
        'История одной эпохи подошла к концу, открывая дорогу тысячам новых исследователей звездных путей.',
      ],
      images: {},
      checked: false,
      wordCount: 29,
    },

    // Book 3 chapters
    {
      id: 'chap-3-1',
      bookId: book3Id,
      bookName: 'Архивы Древней Цитадели (Дополнение)',
      title: 'Приложение 1. Каталог Артефактов',
      paragraphs: [
        '1. Сфера Хроноса — источник локального искажения пространства-времени.',
        '2. Кристаллический Хронометр — портативное устройство измерения квантовых флуктуаций.',
        '3. Навигационная Астралябия — прибор для ориентирования по созвездиям Внешнего Рукава.',
      ],
      images: {},
      checked: false,
      wordCount: 28,
    },
    {
      id: 'chap-3-2',
      bookId: book3Id,
      bookName: 'Архивы Древней Цитадели (Дополнение)',
      title: 'Приложение 2. Хронология Экспедиции',
      paragraphs: [
        'День 1: Высадка на плато Норд-Вест.',
        'День 14: Обнаружение Седьмого Портала.',
        'День 28: Активация главного ядра и восстановление стабильности сектора.',
      ],
      images: {},
      checked: false,
      wordCount: 20,
    },
  ];

  return { books, chapters };
}

/**
 * Smart natural sorter matching the Python desktop app algorithm
 * Extracts numbers, ranges (e.g. 1-5, 10-15), chapter labels (Глава 1, Chapter 2), etc.
 */

export class SmartSorter {
  static extractNumbers(item: { title?: string; name?: string }): [number, number, string] {
    const name = (item.title || item.name || '').trim();

    // Pattern 1: Range like "1-5", "10–20", "3 — 4"
    const rangeMatch = name.match(/(\d+)\s*[-–—]\s*(\d+)/);
    if (rangeMatch) {
      return [parseInt(rangeMatch[1], 10), parseInt(rangeMatch[2], 10), name.toLowerCase()];
    }

    const patterns = [
      /[Гг]лава\s*\.?\s*(\d+)/i,
      /[Cc]hapter\s*\.?\s*(\d+)/i,
      /(\d+)\s*[Гг]лава/i,
      /(\d+)\s*[Cc]hapter/i,
      /\s(\d+)\./,
      /^(\d+)/,
      /(\d+)/,
    ];

    for (const pattern of patterns) {
      const match = name.match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        return [num, num, name.toLowerCase()];
      }
    }

    return [999999, 999999, name.toLowerCase()];
  }

  static sort<T extends { title?: string; name?: string }>(items: T[]): T[] {
    return [...items].sort((a, b) => {
      const [startA, endA, nameA] = SmartSorter.extractNumbers(a);
      const [startB, endB, nameB] = SmartSorter.extractNumbers(b);

      if (startA !== startB) {
        return startA - startB;
      }
      if (endA !== endB) {
        return endA - endB;
      }
      return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
    });
  }
}

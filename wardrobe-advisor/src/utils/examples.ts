function normalizeSuggestionToKeywords(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s,-]/g, '')
    .split(/[\s,]+/)
    .filter(Boolean)
    .slice(0, 6);
}

function buildQueryFromSuggestion(s: string): string {
  const base = ['outfit', 'look', 'streetstyle'];
  const words = normalizeSuggestionToKeywords(s);
  const merged = Array.from(new Set([...base, ...words]));
  return merged.join(',');
}

export function buildExampleImageUrls(suggestions: string[], total: number = 8, seedPrefix: string = 'wardrobe'): string[] {
  if (!suggestions || suggestions.length === 0) return [];
  const urls: string[] = [];
  let i = 0;
  while (urls.length < total) {
    const suggestion = suggestions[i % suggestions.length];
    const query = buildQueryFromSuggestion(suggestion);
    const lock = `${seedPrefix}-${i}`;
    // loremflickr provides keyword-based placeholder images with a 'lock' to keep results stable
    const url = `https://loremflickr.com/560/840/${encodeURIComponent(query)}?lock=${encodeURIComponent(lock)}`;
    urls.push(url);
    i += 1;
  }
  return urls;
}
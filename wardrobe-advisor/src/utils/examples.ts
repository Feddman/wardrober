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
    const seed = `${seedPrefix}-${i}-${encodeURIComponent(suggestion.slice(0, 24))}`;
    const url = `https://source.unsplash.com/seed/${seed}/800x1200/?${encodeURIComponent(query)}`;
    urls.push(url);
    i += 1;
  }
  return urls;
}
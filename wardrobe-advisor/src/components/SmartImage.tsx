import { Image } from 'react-native';
import { useMemo, useState } from 'react';

function wrapProxy(u: string): string {
  const base = process.env.EXPO_PUBLIC_API_BASE;
  return base ? `${base}/proxy-image?url=${encodeURIComponent(u)}` : u;
}

function extractUnsplashQuery(u: string): string | null {
  try {
    const url = new URL(u);
    if (!url.hostname.includes('unsplash.com')) return null;
    return url.search ? decodeURIComponent(url.search.replace(/^\?/, '')) : '';
  } catch {
    return null;
  }
}

function buildUnsplashFallbacks(original: string): string[] {
  const q = extractUnsplashQuery(original) || '';
  const size = '640x960';
  const fallbacks = [
    // No-seed direct query
    `https://source.unsplash.com/${size}/?${encodeURIComponent(q)}`,
    // Featured endpoint
    `https://source.unsplash.com/featured/${size}/?${encodeURIComponent(q)}`,
    // Random endpoint
    `https://source.unsplash.com/random/${size}/?${encodeURIComponent(q)}`,
  ];
  return fallbacks;
}

export default function SmartImage({ uri, style }: { uri: string; style: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const candidates = useMemo(() => {
    const list = [uri];
    if (uri.includes('source.unsplash.com')) {
      list.push(...buildUnsplashFallbacks(uri));
    }
    return list.map(wrapProxy);
  }, [uri]);

  const current = candidates[Math.min(currentIndex, candidates.length - 1)];

  return (
    <Image
      source={{ uri: current }}
      style={style}
      resizeMode="cover"
      onError={() => {
        if (currentIndex < candidates.length - 1) {
          setCurrentIndex((i) => i + 1);
        }
      }}
    />
  );
}
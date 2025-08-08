import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export type OutfitItem = { type: string; color?: string; notes?: string };
export type OutfitAdvice = { moreFormal: string[]; moreCasual: string[] };
export type OutfitAnalysis = { items: OutfitItem[]; advice: OutfitAdvice };

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5055';

async function uriToBase64Web(uri: string): Promise<string> {
  // Handle data URLs directly
  if (uri.startsWith('data:')) {
    const commaIdx = uri.indexOf(',');
    return commaIdx >= 0 ? uri.slice(commaIdx + 1) : '';
  }
  // Fetch blob and convert via FileReader
  const res = await fetch(uri, { mode: 'cors' });
  const blob = await res.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function analyzeOutfit(imageUri: string, context: 'selfie' | 'mirror' = 'mirror'): Promise<OutfitAnalysis> {
  let base64: string;
  if (Platform.OS === 'web') {
    base64 = await uriToBase64Web(imageUri);
  } else {
    base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
  }

  const res = await fetch(`${API_BASE}/analyze-outfit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64: base64, context })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Analyze failed: ${text}`);
  }
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Analyze failed');
  return json.data as OutfitAnalysis;
}
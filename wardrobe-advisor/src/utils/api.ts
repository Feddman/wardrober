import * as FileSystem from 'expo-file-system';

export type OutfitItem = { type: string; color?: string; notes?: string };
export type OutfitAdvice = { moreFormal: string[]; moreCasual: string[] };
export type OutfitAnalysis = { items: OutfitItem[]; advice: OutfitAdvice };

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://localhost:5055';

export async function analyzeOutfit(imageUri: string, context: 'selfie' | 'mirror' = 'mirror'): Promise<OutfitAnalysis> {
  const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
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
import { useRoute } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { analyzeOutfit, OutfitAnalysis, generateExampleImages } from '../utils/api';
import { buildExampleImageUrls, wrapWithProxy } from '../utils/examples';
import ImageScroller from '../components/ImageScroller';
import { useState } from 'react';

export default function ResultsScreen() {
  const route = useRoute<any>();
  const imageUri = route.params?.imageUri as string;
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [exampleImages, setExampleImages] = useState<string[] | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.primary, loading && { opacity: 0.8 }]}
          disabled={loading}
          onPress={async () => {
            try {
              setLoading(true);
              const res = await analyzeOutfit(imageUri);
              setAnalysis(res);
              try {
                const imgs = await generateExampleImages(res.advice?.moreFormal ?? [], res.advice?.moreCasual ?? [], res.items ?? []);
                setExampleImages(imgs.slice(0, 2));
              } catch (e) {
                // non-fatal if generation fails
                console.warn('generate examples failed', e);
              }
            } catch (e: any) {
              alert(e?.message || 'Failed to analyze');
            } finally {
              setLoading(false);
            }
          }}
        >
          <Text style={styles.primaryText}>{loading ? 'Analyzing…' : 'Analyze with AI'}</Text>
        </TouchableOpacity>
      </View>

      {analysis && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detected items</Text>
          {analysis.items?.length ? (
            analysis.items.map((it, i) => (
              <Text key={i} style={styles.cardText}>
                - {it.type}
                {it.color ? ` (${it.color})` : ''}
                {it.notes ? ` — ${it.notes}` : ''}
              </Text>
            ))
          ) : (
            <Text style={styles.cardText}>No items detected.</Text>
          )}

          <View style={{ height: 12 }} />
          <Text style={styles.cardTitle}>Make it more formal</Text>
          {analysis.advice?.moreFormal?.length ? (
            <>
              {analysis.advice.moreFormal.map((t, i) => (
                <Text key={i} style={styles.cardText}>- {t}</Text>
              ))}
              {exampleImages?.[0] && (
                <ImageScroller title="AI Example" urls={[exampleImages[0]]} />
              )}
            </>
          ) : (
            <Text style={styles.cardText}>No tips.</Text>
          )}

          <View style={{ height: 12 }} />
          <Text style={styles.cardTitle}>Make it more casual</Text>
          {analysis.advice?.moreCasual?.length ? (
            <>
              {analysis.advice.moreCasual.map((t, i) => (
                <Text key={i} style={styles.cardText}>- {t}</Text>
              ))}
              {exampleImages?.[1] && (
                <ImageScroller title="AI Example" urls={[exampleImages[1]]} />
              )}
            </>
          ) : (
            <Text style={styles.cardText}>No tips.</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  image: { width: '100%', height: 360, borderRadius: 12, marginBottom: 12, backgroundColor: '#eee' },
  controls: { marginBottom: 12 },
  primary: { backgroundColor: '#111827', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },

  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontWeight: '700', marginBottom: 6 },
  cardText: { color: '#374151' },
});
import { RouteProp, useRoute } from '@react-navigation/native';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { generateColorPlan, Formality } from '../utils/colorEngine';
import { useState } from 'react';

export default function ResultsScreen() {
  const route = useRoute<any>();
  const imageUri = route.params?.imageUri as string;
  const [formality, setFormality] = useState<Formality>('casual');
  const [metal, setMetal] = useState<'gold' | 'silver' | 'both'>('both');

  const baseColor = route.params?.baseColor as string | undefined;
  const plan = generateColorPlan({ baseColors: [baseColor ?? '#1F2937'], formality, preferredMetal: metal });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      <View style={styles.controls}>
        <Text style={styles.sectionTitle}>Occasion</Text>
        <View style={styles.row}>
          {(['casual', 'smart', 'formal'] as Formality[]).map((f) => (
            <TouchableOpacity key={f} style={[styles.chip, formality === f && styles.chipActive]} onPress={() => setFormality(f)}>
              <Text style={[styles.chipText, formality === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.sectionTitle}>Metal</Text>
        <View style={styles.row}>
          {(['gold', 'silver', 'both'] as const).map((m) => (
            <TouchableOpacity key={m} style={[styles.chip, metal === m && styles.chipActive]} onPress={() => setMetal(m)}>
              <Text style={[styles.chipText, metal === m && styles.chipTextActive]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.sectionTitle}>Suggestions</Text>
      {plan.suggestions.map((s, idx) => (
        <View key={idx} style={styles.card}>
          <Text style={styles.cardTitle}>{s.title}</Text>
          <Text style={styles.cardText}>{s.details}</Text>
          <View style={styles.colorRow}>
            {s.colors.map((c, i) => (
              <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  image: { width: '100%', height: 360, borderRadius: 12, marginBottom: 12, backgroundColor: '#eee' },
  controls: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, backgroundColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#111827' },
  chipText: { color: '#111827' },
  chipTextActive: { color: '#fff' },

  sectionTitle: { fontSize: 16, fontWeight: '600', marginVertical: 8 },

  card: { backgroundColor: '#fff', padding: 12, borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTitle: { fontWeight: '700', marginBottom: 6 },
  cardText: { color: '#374151' },
  colorRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  swatch: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
});
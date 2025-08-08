import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const PRESETS = ['#1F2937', '#111827', '#0EA5E9', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F472B6', '#94A3B8', '#D97706'];

export default function ColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  return (
    <View>
      <Text style={styles.label}>Base color (manual for now)</Text>
      <View style={styles.row}>
        {PRESETS.map((c) => (
          <TouchableOpacity key={c} style={[styles.swatch, { backgroundColor: c }, value === c && styles.selected]} onPress={() => onChange(c)} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: '#374151', marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 28, height: 28, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  selected: { borderColor: '#111827', borderWidth: 2 },
});
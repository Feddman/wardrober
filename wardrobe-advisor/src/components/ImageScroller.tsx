import { ScrollView, Image, View, Text, StyleSheet } from 'react-native';

export default function ImageScroller({ title, urls }: { title: string; urls: string[] }) {
  if (!urls || urls.length === 0) return null;
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={styles.title}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {urls.map((u, i) => (
          <Image key={i} source={{ uri: u }} style={styles.image} resizeMode="cover" />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 6 },
  row: { gap: 8 },
  image: { width: 140, height: 210, borderRadius: 10, backgroundColor: '#eee' },
});
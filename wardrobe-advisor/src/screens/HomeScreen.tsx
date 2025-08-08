import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wardrobe Advisor</Text>
      <Text style={styles.subtitle}>Snap a selfie or mirror photo to get AI outfit tips.</Text>
      <TouchableOpacity style={styles.primary} onPress={() => navigation.navigate('Camera')}>
        <Text style={styles.primaryText}>Open Camera</Text>
      </TouchableOpacity>
      <View style={{ height: 12 }} />
      <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Results', { imageUri: 'https://picsum.photos/800/1200' })}>
        <Text style={styles.secondaryText}>Try with sample photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 48 },
  title: { fontSize: 24, fontWeight: '800' },
  subtitle: { color: '#374151', marginTop: 4, marginBottom: 16 },
  primary: { backgroundColor: '#111827', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: { backgroundColor: '#E5E7EB', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  secondaryText: { color: '#111827', fontWeight: '700' },
});
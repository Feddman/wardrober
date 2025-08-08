import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useNavigation } from '@react-navigation/native';

export type CameraMode = 'selfie' | 'mirror';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<CameraMode>('mirror');
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, [permission]);

  const handleTakePhoto = async () => {
    try {
      setIsProcessing(true);
      const camera = cameraRef.current;
      if (!camera) return;
      const photo = await camera.takePictureAsync({ quality: 0.9, skipProcessing: false });

      let uri = photo.uri;

      // Mirror mode: auto-flip horizontally (mirrors invert)
      if (mode === 'mirror') {
        const manipulated = await ImageManipulator.manipulateAsync(
          uri,
          [{ flip: ImageManipulator.FlipType.Horizontal }],
          { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
        );
        uri = manipulated.uri;
      }

      navigation.navigate('Results', { imageUri: uri });
    } catch (e) {
      console.warn(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePickFromGallery = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled) {
      const uri = res.assets[0].uri;
      navigation.navigate('Results', { imageUri: uri });
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}> 
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing={mode === 'selfie' ? 'front' : 'back'} />
      <View style={styles.controls}>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'selfie' && styles.modeButtonActive]}
            onPress={() => setMode('selfie')}
          >
            <Text style={styles.modeText}>Selfie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'mirror' && styles.modeButtonActive]}
            onPress={() => setMode('mirror')}
          >
            <Text style={styles.modeText}>Mirror</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handlePickFromGallery}>
            <Text style={styles.secondaryText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto} disabled={isProcessing}>
            <Text style={styles.captureText}>{isProcessing ? '...' : 'Snap'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  controls: {
    paddingBottom: 24,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  modeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  modeButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.25)'
  },
  modeText: { color: '#fff' },
  actionRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  secondaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  secondaryText: { color: '#fff' },
  captureButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 32,
    backgroundColor: '#fff'
  },
  captureText: { fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  button: { marginTop: 12, backgroundColor: '#111827', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '700' }
});
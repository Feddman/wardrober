## Wardrobe Advisor (Frontend)

An Expo (React Native + TypeScript) app that lets you snap a selfie or mirror photo of your outfit and get AI-powered styling advice. The MVP focuses on AI analysis only.

### Features
- Camera with Selfie and Mirror modes (auto-flip for mirror)
- Pick from gallery
- Analyze with AI: detect items (top, bottom, shoes, etc.) and get tips to make the outfit more formal or more casual

### Tech stack
- Expo SDK 53, React Native 0.79, React 19
- Navigation: `@react-navigation/native`, `@react-navigation/native-stack`
- Camera: `expo-camera`
- Media: `expo-image-picker`, `expo-image-manipulator`
- File access: `expo-file-system` (native only)
- Web image base64 conversion via `fetch` + `FileReader` (no native modules)

### Prerequisites
- Node.js 18+ and npm
- The backend server running locally or accessible over the network (see the Server README)

### Install
```
npm install
```

### Configure environment
Set the API base URL so the app can reach your server.

- macOS/Linux (bash/zsh):
```
export EXPO_PUBLIC_API_BASE=http://localhost:5055
```
- Windows PowerShell:
```
$env:EXPO_PUBLIC_API_BASE="http://localhost:5055"
```
- Windows CMD:
```
set EXPO_PUBLIC_API_BASE=http://localhost:5055
```

Notes:
- iOS Simulator can use `http://localhost:5055`.
- Android Emulator must use `http://10.0.2.2:5055`.
- Physical device (Expo Go) must use your LAN IP, e.g., `http://192.168.1.23:5055`.
- Restart the Expo dev server after changing environment variables.

### Run
- Web:
```
npm run web
```
- Android (emulator or device with Expo Go):
```
npm run android
```
- iOS (simulator on macOS, or Expo Go):
```
npm run ios
```

### Usage
1. Open the app.
2. Tap “Open Camera” to take a selfie or mirror photo, or use “Try with sample photo”.
3. On the results screen, press “Analyze with AI”.
4. View detected items and tips to dress the look up or down.

### Scripts
- Type check: `npm run typecheck`

### Troubleshooting
- Network request failed
  - Ensure the server is running and reachable: open `EXPO_PUBLIC_API_BASE/health` in your browser (should return `{ ok: true }`).
  - On Android emulator, use `10.0.2.2` instead of `localhost`.
  - On a physical device with Expo Go, use your computer’s LAN IP.
- 400 error about image type
  - Make sure you’re running the latest server (uses `image_url` for OpenAI Vision input).
- expo-file-system not available on web
  - The app already avoids `expo-file-system` on web and uses `FileReader`. If you altered code, revert to the included `src/utils/api.ts` approach.
- Large images on web
  - The app downscales images on web before upload. If you still hit limits, verify your server JSON body limit is at least 20 MB.

### Privacy
- Images are sent to your AI server only when you tap “Analyze with AI”.
- No photos are stored by the app; storage/backups are out of scope for this MVP.

### Project layout
- `App.tsx`: Navigation entry
- `src/screens/HomeScreen.tsx`: Entry screen
- `src/screens/CameraScreen.tsx`: Camera & gallery
- `src/screens/ResultsScreen.tsx`: Shows the captured image and AI analysis
- `src/utils/api.ts`: Client for the AI server
- `src/utils/imageUtil.ts`: Web-only downscale helper
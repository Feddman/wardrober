## Wardrobe Advisor Server (Backend)

A minimal Node/Express server that accepts an outfit image, calls OpenAI Vision to detect clothing items, and returns tips to make the outfit more formal or more casual.

### Features
- `/analyze-outfit` endpoint: accepts base64 image (JPEG/PNG) and returns structured JSON
- `/health` endpoint for reachability checks

### Tech stack
- Node.js + Express + CORS
- OpenAI SDK
- Zod for request validation
- dotenv for environment config

### Prerequisites
- Node.js 18+
- An OpenAI API key with access to a Vision-capable model

### Install
```
npm install
```

### Configure environment
Create a `.env` file in the server root:
```
OPENAI_API_KEY=sk-...your-key...
PORT=5055
```

### Run
```
node index.js
```
The server will listen on `http://localhost:5055` (or the port you set).

### Endpoints
- GET `/health`
  - Returns `{ ok: true }` if the server is up.

- POST `/analyze-outfit`
  - Body (JSON):
    ```json
    {
      "imageBase64": "<base64 without data URL prefix>",
      "context": "selfie" | "mirror" // optional
    }
    ```
  - Response (JSON):
    ```json
    {
      "ok": true,
      "data": {
        "items": [ { "type": "top", "color": "navy", "notes": "..." } ],
        "advice": {
          "moreFormal": ["..."],
          "moreCasual": ["..."]
        }
      }
    }
    ```

### Notes on Vision payload
- The server sends the image to OpenAI using an `image_url` with a data URL (`data:image/jpeg;base64,...`).
- Increase body size limits if needed (currently `20mb`) in `index.js`.

### CORS / Networking
- CORS is enabled by default for development.
- When calling from the frontend on web:
  - Use `EXPO_PUBLIC_API_BASE` set to `http://localhost:5055` (same machine)
  - On Android emulator, use `http://10.0.2.2:5055`
  - On physical devices, use your LAN IP (e.g. `http://192.168.1.23:5055`)

### Troubleshooting
- 401/403 from OpenAI
  - Ensure `OPENAI_API_KEY` is set and valid.
- 400 Invalid value 'input_image'
  - Update to the latest server code. It must use `{ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,...' } }`.
- Network request failed (from frontend)
  - Verify the server is running and reachable at `/health`.
  - Check that your frontend `EXPO_PUBLIC_API_BASE` points to a reachable host from your device/emulator.
- Payload too large
  - The frontend downscales on web before upload. You can also bump `express.json({ limit: '20mb' })` further if needed.

### Security
- This server is for development/demo. Add auth/rate-limiting and logging for production.
- Avoid storing raw images unless necessary; prefer derived metadata.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { z } = require('zod');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const AnalyzeBody = z.object({
  imageBase64: z.string().min(10),
  context: z.enum(['selfie', 'mirror']).optional().default('mirror')
});

app.post('/analyze-outfit', async (req, res) => {
  try {
    const body = AnalyzeBody.parse(req.body);

    const messages = [
      {
        role: 'system',
        content:
          'You are a stylist AI. From a single outfit photo, identify garment items and their colors (top, bottom, dress, jacket, shoes, bag). Then give suggestions to make it more formal and more casual. Keep answers concise with bullet points.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this outfit and respond as JSON with {items: [{type, color, notes?}], advice: {moreFormal: string[], moreCasual: string[]}}' },
          {
            type: 'input_image',
            image_url: `data:image/jpeg;base64,${body.imageBase64}`
          }
        ]
      }
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages,
      response_format: { type: 'json_object' }
    });

    const text = response.choices?.[0]?.message?.content || '{}';
    const json = JSON.parse(text);
    res.json({ ok: true, data: json });
  } catch (err) {
    console.error(err);
    res.status(400).json({ ok: false, error: err.message || 'Bad Request' });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
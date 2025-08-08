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
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${body.imageBase64}` }
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

const GenerateBody = z.object({
  suggestionsFormal: z.array(z.string()).optional().default([]),
  suggestionsCasual: z.array(z.string()).optional().default([]),
  items: z.array(z.object({ type: z.string(), color: z.string().optional() })).optional().default([])
});

app.post('/generate-examples', async (req, res) => {
  try {
    const body = GenerateBody.parse(req.body);

    const topFormal = body.suggestionsFormal[0] || 'smart casual outfit with blazer and leather shoes';
    const topCasual = body.suggestionsCasual[0] || 'casual outfit with denim jacket and sneakers';

    const colorHints = body.items
      .filter((it) => it.color)
      .slice(0, 2)
      .map((it) => `${it.type} in ${it.color}`)
      .join(', ');

    function buildPrompt(tone, suggestion) {
      return [
        'High-quality editorial fashion photo of a full outfit, single person, neutral background, natural lighting, street style.',
        tone ? `Style: ${tone}.` : '',
        suggestion ? `Inspiration: ${suggestion}.` : '',
        colorHints ? `Colors to incorporate (optional): ${colorHints}.` : '',
        'No logos or brand text.'
      ]
        .filter(Boolean)
        .join(' ');
    }

    const [formalRes, casualRes] = await Promise.all([
      client.images.generate({ model: 'gpt-image-1', prompt: buildPrompt('more formal', topFormal), size: '768x1024', n: 1 }),
      client.images.generate({ model: 'gpt-image-1', prompt: buildPrompt('more casual', topCasual), size: '768x1024', n: 1 })
    ]);

    const img1 = formalRes?.data?.[0]?.b64_json;
    const img2 = casualRes?.data?.[0]?.b64_json;
    if (!img1 || !img2) throw new Error('Image generation failed');

    const out = [
      `data:image/png;base64,${img1}`,
      `data:image/png;base64,${img2}`
    ];

    res.json({ ok: true, images: out });
  } catch (err) {
    console.error('generate-examples error', err);
    res.status(400).json({ ok: false, error: err.message || 'Bad Request' });
  }
});

app.get('/proxy-image', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url || typeof url !== 'string') return res.status(400).send('Missing url');
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) return res.status(502).send(`Upstream error: ${r.status}`);
    const contentType = r.headers.get('content-type') || 'image/jpeg';
    const buf = Buffer.from(await r.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(buf);
  } catch (e) {
    console.error('proxy-image error', e);
    return res.status(500).send('Proxy failed');
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function run() {
  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `
Generate 2 multiple-choice questions about German food culture.
Each question must be valid JSON like:
[
  {"id":"q1","question":"...","choices":["..."],"answer":0,"hint":"...","difficulty":"easy"}
]
Return ONLY the JSON array.
      `,
    });

    // ✅ Extract the text
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    console.log('✅ Raw Gemini output:');
    console.log(rawText);

    // ✅ Clean code fences like ```json ... ```
    const cleanText = rawText
      .replace(/```json/i, '')
      .replace(/```/g, '')
      .trim();

    // ✅ Parse JSON safely
    let data;
    try {
      data = JSON.parse(cleanText);
      console.log('✅ Parsed JSON:');
      console.dir(data, { depth: null });
    } catch (parseErr) {
      console.warn('⚠️ Could not parse JSON. Showing cleaned text:');
      console.log(cleanText);
    }
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

run();

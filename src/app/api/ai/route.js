import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini with your secret key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Select the model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Generate output
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ success: true, response: text });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase() || 'AAPL';
  const finnhubKey = process.env.FINNHUB_API_KEY;

  try {
    // 1. Fetch live quote data from Finnhub
    const quoteRes = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`
    );
    const quoteData = await quoteRes.json();

    // 2. Fetch basic profile data from Finnhub
    const profileRes = await fetch(
      `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubKey}`
    );
    const profileData = await profileRes.json();

    // Standardize data points
    const currentPrice = quoteData.c || 0;
    const change = quoteData.d || 0;
    const percentChange = quoteData.dp || 0;
    const high = quoteData.h || 0;
    const low = quoteData.l || 0;
    const companyName = profileData.name || symbol;

    // 3. Request AI Analysis from OpenAI
    const prompt = `
      You are trade.ai, an educational assistant helping beginner investors understand stock metrics without complex jargon.
      Analyze the following stock:
      - Company: ${companyName} (${symbol})
      - Current Price: $${currentPrice}
      - Daily Change: ${change} (${percentChange}%)
      - Day High: $${high}
      - Day Low: $${low}

      Provide a structured JSON response with:
      1. "sentiment": "Bullish", "Bearish", or "Neutral"
      2. "riskLevel": "Low", "Medium", or "High"
      3. "summary": A 2-sentence breakdown of how the stock is performing today for beginners.
      4. "keyTakeaway": One actionable educational tip (e.g., watch list consideration, hold, research further).
    `;

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const aiAnalysis = JSON.parse(
      aiResponse.choices[0].message.content || '{}'
    );

    return NextResponse.json({
      symbol,
      companyName,
      metrics: {
        currentPrice,
        change,
        percentChange,
        high,
        low,
      },
      analysis: aiAnalysis,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stock analysis.' },
      { status: 500 }
    );
  }
}

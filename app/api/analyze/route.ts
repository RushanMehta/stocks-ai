import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol')?.toUpperCase() || 'AAPL';
  const finnhubKey = process.env.FINNHUB_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  try {
    // 1. Fetch live quote data from Finnhub (or use mock if no key provided)
    let currentPrice = 185.50;
    let change = 2.40;
    let percentChange = 1.31;
    let high = 187.00;
    let low = 184.20;
    let companyName = symbol;

    if (finnhubKey && finnhubKey !== 'your_finnhub_api_key_here') {
      const quoteRes = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`
      );
      const quoteData = await quoteRes.json();

      const profileRes = await fetch(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${finnhubKey}`
      );
      const profileData = await profileRes.json();

      currentPrice = quoteData.c || currentPrice;
      change = quoteData.d || change;
      percentChange = quoteData.dp || percentChange;
      high = quoteData.h || high;
      low = quoteData.l || low;
      companyName = profileData.name || symbol;
    }

    // 2. Check for OpenAI Key - use Real AI if available, otherwise return Mock Analysis
    let aiAnalysis;

    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      const openai = new OpenAI({ apiKey: openaiKey });
      
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
        4. "keyTakeaway": One actionable educational tip.
      `;

      const aiResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      });

      aiAnalysis = JSON.parse(aiResponse.choices[0].message.content || '{}');
    } else {
      // Mock AI response for local testing
      aiAnalysis = {
        sentiment: percentChange >= 0 ? 'Bullish' : 'Bearish',
        riskLevel: 'Medium',
        summary: `${companyName} (${symbol}) is currently trading at $${currentPrice.toFixed(2)}, showing a daily change of ${percentChange.toFixed(2)}%. The stock is displaying stable volume with steady trading interest today.`,
        keyTakeaway: 'This is mock data mode. Add an OpenAI key in .env.local to generate live AI sentiment analysis.'
      };
    }

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

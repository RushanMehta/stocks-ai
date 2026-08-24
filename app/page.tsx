'use client';

import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';

interface StockData {
  symbol: string;
  companyName: string;
  metrics: {
    currentPrice: number;
    change: number;
    percentChange: number;
    high: number;
    low: number;
  };
  analysis: {
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    riskLevel: 'Low' | 'Medium' | 'High';
    summary: string;
    keyTakeaway: string;
  };
}

export default function Dashboard() {
  const [searchSymbol, setSearchSymbol] = useState('AAPL');
  const [ticker, setTicker] = useState('AAPL');
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStockData = async (symbolToFetch: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/analyze?symbol=${symbolToFetch}`);
      if (!res.ok) throw new Error('Failed to load stock data.');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError('Could not fetch data for this symbol. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData(ticker);
  }, [ticker]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchSymbol.trim()) {
      setTicker(searchSymbol.trim().toUpperCase());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 font-sans">
      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-10 pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-slate-950" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">trade<span className="text-emerald-400">.ai</span></h1>
        </div>
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
          Beginner Market Assistant
        </span>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-4 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-500" />
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value)}
              placeholder="Search ticker (e.g., AAPL, TSLA, NVDA)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Analyze
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 text-rose-400 bg-rose-950/40 border border-rose-800/50 p-4 rounded-xl max-w-xl mx-auto">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400 mx-auto mb-4"></div>
            Analyzing market metrics with trade.ai...
          </div>
        ) : data ? (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Price Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-400">{data.companyName}</h2>
                <p className="text-3xl font-extrabold text-white">{data.symbol}</p>
              </div>
              <div className="text-4xl font-black text-white">
                ${data.metrics.currentPrice.toFixed(2)}
              </div>
              <div className={`flex items-center space-x-2 text-sm font-bold ${data.metrics.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {data.metrics.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{data.metrics.change >= 0 ? '+' : ''}{data.metrics.change.toFixed(2)} ({data.metrics.percentChange.toFixed(2)}%)</span>
              </div>
              <div className="pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500">
                <span>High: ${data.metrics.high.toFixed(2)}</span>
                <span>Low: ${data.metrics.low.toFixed(2)}</span>
              </div>
            </div>

            {/* AI Sentiment Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 md:col-span-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                  <h3 className="font-semibold text-lg">AI Market Insights</h3>
                </div>
                <div className="flex space-x-2">
                  <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700">
                    Sentiment: <strong className="text-emerald-400">{data.analysis.sentiment}</strong>
                  </span>
                  <span className="bg-slate-800 text-slate-300 text-xs px-3 py-1 rounded-full border border-slate-700 flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 text-amber-400" />
                    Risk: <strong className="text-amber-400">{data.analysis.riskLevel}</strong>
                  </span>
                </div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-2">
                <p className="text-sm font-medium text-slate-300">Summary:</p>
                <p className="text-sm text-slate-400 leading-relaxed">{data.analysis.summary}</p>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-xl space-y-1">
                <p className="text-xs uppercase font-bold text-emerald-400 tracking-wider">Educational Takeaway</p>
                <p className="text-sm text-emerald-200">{data.analysis.keyTakeaway}</p>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";

type Point = { x: number; y: number };

type HistoryItem = {
  date: string;
  close: number;
  open: number;
  high: number;
  low: number;
  volume: number;
};

const DSE_TICKERS = ["GP", "BATBC", "SQURPHARMA", "BEXIMCO", "LHBL", "RENATA"];

export function StockChart() {
  const [selectedSymbol, setSelectedSymbol] = useState("GP");
  const [historyData, setHistoryData] = useState<number[]>([]);
  const [priceData, setPriceData] = useState({
    price: 0,
    change: 0,
    first: 0,
    high: 0,
    low: 0,
    volume: "0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Fetch 30-day stock history from FastAPI
        const res = await fetch(`http://127.0.0.1:8000/api/stocks/history/${selectedSymbol}?days=30`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const closes = data.map((item: any) => item.close);
            setHistoryData(closes);
            
            // Set current stats from historical points
            const latest = data[data.length - 1];
            const first = data[0].close;
            const currentClose = latest.close;
            const pctChange = ((currentClose - first) / first) * 100;
            const highest = Math.max(...closes);
            const lowest = Math.min(...closes);
            
            setPriceData({
              price: currentClose,
              change: pctChange,
              first: first,
              high: highest,
              low: lowest,
              volume: latest.volume.toLocaleString(),
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch DSE stock history. Generating fallback data.", err);
        // Generative mock chart fallback
        const mockCloses = Array.from({ length: 30 }, (_, i) => {
          const base = selectedSymbol === "GP" ? 268.5 : selectedSymbol === "BATBC" ? 395.2 : 120.0;
          return base + (Math.sin(i / 2) * (base * 0.05)) + (Math.random() * (base * 0.02));
        });
        setHistoryData(mockCloses);
        const first = mockCloses[0];
        const latest = mockCloses[mockCloses.length - 1];
        setPriceData({
          price: latest,
          change: ((latest - first) / first) * 100,
          first: first,
          high: Math.max(...mockCloses),
          low: Math.min(...mockCloses),
          volume: "1,245,200",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [selectedSymbol]);

  // Polling simulation for live price tick updates (every 4s)
  useEffect(() => {
    const id = setInterval(() => {
      if (historyData.length === 0) return;
      
      setPriceData((prev) => {
        const delta = (Math.random() - 0.48) * (prev.price * 0.005);
        const newPrice = Math.max(1, prev.price + delta);
        const newHistory = [...historyData.slice(1), newPrice];
        setHistoryData(newHistory);
        
        return {
          ...prev,
          price: newPrice,
          change: ((newPrice - prev.first) / prev.first) * 100,
          high: Math.max(prev.high, newPrice),
          low: Math.min(prev.low, newPrice),
        };
      });
    }, 4000);
    return () => clearInterval(id);
  }, [historyData]);

  const W = 800;
  const H = 320;
  const min = Math.min(...(historyData.length > 0 ? historyData : [100]));
  const max = Math.max(...(historyData.length > 0 ? historyData : [200]));
  const range = max - min || 1;
  
  const points: Point[] = historyData.map((v, i) => ({
    x: (i / (historyData.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 20) - 10,
  }));
  
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${W} ${H} L 0 ${H} Z`;

  const positive = priceData.change >= 0;

  return (
    <div className="glass rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-neon)] to-transparent animate-scan" />
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest mb-2">
            <span className="size-2 rounded-full bg-[var(--color-bull)] animate-pulse-glow" />
            Live · Dhaka Stock Exchange (DSE)
          </div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-display text-glow">{selectedSymbol} / BDT</h2>
            <div className="flex gap-1.5">
              {DSE_TICKERS.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedSymbol(t)}
                  className={`px-2 py-0.5 text-[9px] font-mono rounded transition-colors ${
                    selectedSymbol === t
                      ? "bg-[var(--color-neon)] text-background font-bold"
                      : "bg-secondary hover:bg-secondary/80 text-muted-foreground border border-border"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-gradient">
            ৳{priceData.price.toFixed(2)}
          </div>
          <div className={`text-sm font-mono ${positive ? "text-[var(--color-bull)]" : "text-[var(--color-bear)]"}`}>
            {positive ? "▲" : "▼"} {Math.abs(priceData.change).toFixed(2)}%
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-[280px] w-full flex items-center justify-center font-mono text-xs text-muted-foreground">
          // Loading DSE analytics...
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[280px]" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.82 0.18 195)" stopOpacity="0.45" />
              <stop offset="100%" stopColor="oklch(0.82 0.18 195)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="chartLine" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="oklch(0.82 0.18 195)" />
              <stop offset="100%" stopColor="oklch(0.65 0.25 305)" />
            </linearGradient>
            <pattern id="grid" width="40" height="32" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 32" fill="none" stroke="oklch(0.4 0.08 260 / 0.2)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#grid)" />
          {points.length > 0 && (
            <>
              <path d={areaPath} fill="url(#chartFill)" />
              <path d={path} fill="none" stroke="url(#chartLine)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"
                style={{ filter: "drop-shadow(0 0 6px oklch(0.82 0.18 195 / 0.6))" }} />
              <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill="oklch(0.82 0.18 195)">
                <animate attributeName="r" values="5;9;5" dur="1.5s" repeatCount="indefinite" />
              </circle>
            </>
          )}
        </svg>
      )}

      <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
        {[
          { l: "Open (30D)", v: `৳${priceData.first.toFixed(2)}` },
          { l: "30D High", v: `৳${priceData.high.toFixed(2)}` },
          { l: "30D Low", v: `৳${priceData.low.toFixed(2)}` },
          { l: "Vol (Latest)", v: priceData.volume },
        ].map((s) => (
          <div key={s.l}>
            <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">{s.l}</div>
            <div className="font-mono text-foreground text-xs md:text-sm">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

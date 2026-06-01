import { useEffect, useState } from "react";

type Stock = { 
  symbol: string; 
  name: string; 
  price: number; 
  change: number;
  high?: number;
  low?: number;
  volume?: string;
};

const DSE_SEED: Stock[] = [
  { symbol: "GP", name: "Grameenphone Ltd.", price: 268.50, change: 1.20, volume: "450,200" },
  { symbol: "BATBC", name: "British American Tobacco Bangladesh", price: 395.20, change: 0.85, volume: "120,500" },
  { symbol: "SQURPHARMA", name: "Square Pharmaceuticals plc", price: 218.40, change: -0.45, volume: "380,400" },
  { symbol: "BEXIMCO", name: "Beximco Limited", price: 115.60, change: 3.10, volume: "1,250,000" },
  { symbol: "LHBL", name: "LafargeHolcim Bangladesh Limited", price: 62.80, change: -1.15, volume: "850,000" },
  { symbol: "RENATA", name: "Renata Limited", price: 725.30, change: 0.40, volume: "45,000" },
];

export function TopStocks() {
  const [stocks, setStocks] = useState<Stock[]>(DSE_SEED);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch from FastAPI backend
    const fetchStocks = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/stocks/live");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setStocks(data);
          }
        }
      } catch (err) {
        console.warn("FastAPI DSE backend offline. Using simulated DSE feed.", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
    const fetchInterval = setInterval(fetchStocks, 5000); // Poll live DSE data every 5s

    return () => clearInterval(fetchInterval);
  }, []);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-glow">DSE Top Movers</h3>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-neon)]">
          Live feed · BDT
        </span>
      </div>
      <ul className="space-y-2">
        {stocks.map((s, i) => {
          const up = s.change >= 0;
          return (
            <li
              key={s.symbol}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-secondary/40 border border-border hover:border-[var(--color-neon)]/50 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                <div>
                  <div className="font-display text-sm font-bold">{s.symbol}</div>
                  <div className="text-[10px] text-muted-foreground">{s.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm">৳{s.price.toFixed(2)}</div>
                <div
                  className={`font-mono text-[10px] ${
                    up ? "text-[var(--color-bull)]" : "text-[var(--color-bear)]"
                  }`}
                >
                  {up ? "▲" : "▼"} {Math.abs(s.change).toFixed(2)}%
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

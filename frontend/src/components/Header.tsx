import { useEffect, useState } from "react";

const DSE_TICKER_SEED = [
  { s: "DSEX", p: 5420.50, c: 0.35 },
  { s: "GP", p: 268.50, c: 1.20 },
  { s: "BATBC", p: 395.20, c: 0.85 },
  { s: "SQURPHARMA", p: 218.40, c: -0.45 },
  { s: "BEXIMCO", p: 115.60, c: 3.10 },
  { s: "LHBL", p: 62.80, c: -1.15 },
  { s: "RENATA", p: 725.30, c: 0.40 },
  { s: "BRACBANK", p: 38.40, c: 1.05 }
];

export function Ticker() {
  const [tickerData, setTickerData] = useState(DSE_TICKER_SEED);

  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/stocks/live");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Map api structure (symbol, price, change) to (s, p, c)
            const mapped = data.map((item: any) => ({
              s: item.symbol,
              p: item.price,
              c: item.change
            }));
            // Prepend DSEX index for completeness
            setTickerData([{ s: "DSEX", p: 5420.50 + (Math.random() - 0.5) * 15, c: 0.35 }, ...mapped]);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch live DSE ticker for header. Using DSE seed.", err);
      }
    };

    fetchTickerData();
    const interval = setInterval(fetchTickerData, 6000); // refresh every 6s
    return () => clearInterval(interval);
  }, []);

  const items = [...tickerData, ...tickerData];
  return (
    <div className="border-y border-border bg-background/60 backdrop-blur overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap py-2.5">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2 px-6 font-mono text-xs">
            <span className="text-muted-foreground">{t.s}</span>
            <span className="text-foreground">৳{t.p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={t.c >= 0 ? "text-[var(--color-bull)]" : "text-[var(--color-bear)]"}>
              {t.c >= 0 ? "+" : ""}{t.c.toFixed(2)}%
            </span>
            <span className="text-border ml-4">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Header() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <header className="border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative size-10 rounded-lg bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-violet)] flex items-center justify-center glow-border">
            <span className="font-display font-black text-background text-lg">S</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-xl tracking-wider text-glow">
              STOCK<span className="text-gradient">SENSE</span>AI
            </h1>
            <div className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground">
              Quantum Market Intelligence
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 font-mono text-xs uppercase tracking-widest">
          {["Markets", "Portfolio", "Signals", "Research"].map((n) => (
            <a key={n} href="#" className="text-muted-foreground hover:text-[var(--color-neon)] transition-colors">
              {n}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right font-mono text-xs">
            <div className="text-[var(--color-bull)]">◉ MARKETS OPEN</div>
            <div className="text-muted-foreground">{time.toUTCString().slice(17, 25)} UTC</div>
          </div>
          <button className="px-4 py-2 rounded-lg border border-[var(--color-neon)]/50 text-[var(--color-neon)] font-mono text-xs uppercase tracking-widest hover:bg-[var(--color-neon)]/10 transition-colors">
            Connect
          </button>
        </div>
      </div>
    </header>
  );
}

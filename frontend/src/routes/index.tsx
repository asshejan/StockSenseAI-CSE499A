import { createFileRoute } from "@tanstack/react-router";
import { Header, Ticker } from "@/components/Header";
import { StockChart } from "@/components/StockChart";
import { TopStocks } from "@/components/TopStocks";
import { Chatbot } from "@/components/Chatbot";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StockSenseAI — Quantum Market Intelligence" },
      { name: "description", content: "Realtime stock market analysis powered by AI. Live charts, top movers, and an intelligent trading assistant." },
      { property: "og:title", content: "StockSenseAI" },
      { property: "og:description", content: "Realtime AI-driven stock market intelligence." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Header />
      <Ticker />

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-[var(--color-neon)] mb-2">
              // Dashboard · Live Feed
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              The future of <span className="text-gradient">market intelligence</span>
            </h2>
          </div>
          <div className="hidden md:flex gap-2 font-mono text-[10px] uppercase tracking-widest">
            {["1D", "1W", "1M", "1Y", "ALL"].map((t) => (
              <button
                key={t}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  t === "1D"
                    ? "border-[var(--color-neon)] text-[var(--color-neon)] bg-[var(--color-neon)]/10"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <StockChart />
            <TopStocks />
          </div>
          <div className="lg:col-span-1">
            <Chatbot />
          </div>
        </div>

        <footer className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <div>© 2026 StockSenseAI · Not financial advice</div>
          <div className="flex gap-4">
            <span>Latency: 12ms</span>
            <span className="text-[var(--color-bull)]">◉ All systems nominal</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

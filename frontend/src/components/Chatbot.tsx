import { useState, useRef, useEffect } from "react";

type Msg = { role: "user" | "ai"; text: string };

const CANNED = [
  "Based on current momentum, GP shows a bullish breakout above its 50-day MA. Volume confirms.",
  "Market sentiment is risk-on on the DSE. Tech and Bank sectors leading. Watch for resistance at recent highs.",
  "I'd flag elevated volatility on BEXIMCO. RSI is approaching overbought (72). Consider a tighter stop.",
  "SQURPHARMA's earnings beat consensus by 4.2%. Forward guidance suggests continued strength in pharmaceutical exports.",
  "BSEC regulations strictly prohibit margin trading for retirees or students to avoid leverage risks.",
];

export function Chatbot() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "ai", text: "I'm SenseAI. Ask me anything about the Dhaka Stock Exchange (DSE), stock tickers (GP, BATBC, BEXIMCO, etc.), or BSEC investment laws and taxes." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    
    // Add user message to state
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);

    try {
      // Map history to backend expected structure
      const history = msgs.map(m => ({
        role: m.role,
        text: m.text
      }));

      // Call FastAPI chatbot endpoint
      const response = await fetch("http://127.0.0.1:8000/api/chatbot/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          history: history
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMsgs((m) => [...m, { role: "ai", text: data.response }]);
      } else {
        throw new Error("Backend response not ok");
      }
    } catch (err) {
      console.warn("FastAPI AI engine offline. Falling back to local DSE mock advisor.", err);
      // Fallback local mock simulation
      setTimeout(() => {
        setMsgs((m) => [...m, { role: "ai", text: CANNED[Math.floor(Math.random() * CANNED.length)] }]);
      }, 800);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className="glass rounded-2xl flex flex-col h-[700px] overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="relative">
          <div className="size-10 rounded-full bg-gradient-to-br from-[var(--color-neon)] to-[var(--color-neon-violet)] flex items-center justify-center font-display font-bold text-background">
            AI
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-[var(--color-bull)] border-2 border-background animate-pulse-glow" />
        </div>
        <div>
          <div className="font-display font-bold text-glow">SenseAI</div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-bull)]">
            ◉ Online · Neural Net v4.2
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-gradient-to-br from-[var(--color-neon)]/30 to-[var(--color-neon-violet)]/30 border border-[var(--color-neon)]/40 rounded-br-sm"
                  : "bg-secondary/60 border border-border rounded-bl-sm"
              }`}
              style={{ whiteSpace: "pre-line" }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-secondary/60 border border-border rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--color-neon)] animate-pulse-glow" />
              <span className="size-1.5 rounded-full bg-[var(--color-neon)] animate-pulse-glow" style={{ animationDelay: "0.2s" }} />
              <span className="size-1.5 rounded-full bg-[var(--color-neon)] animate-pulse-glow" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Analyze a DSE stock, ask about taxes..."
          className="flex-1 bg-input/50 border border-border focus:border-[var(--color-neon)] focus:outline-none rounded-xl px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground/60 transition-colors"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-neon)] to-[var(--color-neon-violet)] text-background font-display font-bold text-sm hover:opacity-90 transition-opacity"
        >
          Send
        </button>
      </form>
    </div>
  );
}

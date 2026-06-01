# 📈 StockSenseAI
> **Quantum Market Intelligence & Regulatory Copilot for the Dhaka Stock Exchange (DSE)**

StockSenseAI is a state-of-the-art dual-layer financial application designed to empower retail and institutional investors in the Bangladesh Capital Market. It integrates real-time DSE market data feeds, dynamic historical chart visualizations, and **SenseAI**, a quantum intelligence chatbot trained on BSEC regulatory documents, capital gains tax rules, margin account restrictions, and 20 years of historical trading patterns.

---

## 🌟 Key Features

1. **⚡ Real-Time DSE Marquee Feed**
   * High-frequency ticker marquee tracking prime DSE listings (GP, BATBC, BEXIMCO, SQURPHARMA, LHBL, RENATA, BRACBANK).
   * Live calculation and injection of the **DSEX General Index**.
   * Automatic BDT (৳) pricing with responsive change markers.

2. **📊 Interactive Price Trajectory Engine**
   * Multi-stock historical visualization charting 30-day opening, closing, volatility peaks, and trading volumes.
   * Responsive canvas graphs tracking market adjustments.
   * Instantly switchable stock selectors with hot-reloaded REST parameters.

3. **🤖 SenseAI Chatbot (Regulatory Copilot)**
   * **BSEC Compliance RAG:** Programmed with institutional knowledge from the Bangladesh Securities and Exchange Commission (BSEC) and CDBL rules.
   * **Taxation & Margin Guidance:** Ready to explain the **15% Capital Gains Tax** (above Tk. 50 Lakh), Category A/B/N/Z settlement cycles, and standard 1:1 margin rules.
   * **Contextual Data Ingestion:** Intelligently combines live stock feeds with Google Gemini LLM capabilities to deliver investment recommendations accompanied by appropriate risk disclosures.

---

## 🏗️ System Architecture

```mermaid
graph TD
    subgraph Frontend [React Dev Client - Port 5173]
        A[Header Ticker Marquee] -->|GET /api/stocks/live| C(FastAPI Gateway)
        B[Stock Chart Component] -->|GET /api/stocks/history/{symbol}| C
        D[SenseAI Chat Interface] -->|POST /api/chatbot/query| C
    end

    subgraph Backend [FastAPI Server - Port 8000]
        C --> E[DSE Service]
        C --> F[Chatbot Service]
        E -->|Scrapes DSE / Fallback Simulation| G[(bdshare Engine)]
        F -->|Loads Context| H[(regulations.txt)]
        F -->|Generates Response| I[Google Gemini API]
    end
```

---

## 📂 Project Structure

```
StockSenseAI/
├── Backend/                    # FastAPI Microservice Gateway
│   ├── app/
│   │   ├── api/routes/        # Rest Endpoints (stocks.py, chatbot.py)
│   │   ├── core/config.py     # Settings & ENV Ingestion
│   │   ├── data/              # Regulatory Corpus (regulations.txt)
│   │   ├── schemas/           # Pydantic Types (stock.py, chatbot.py)
│   │   ├── services/          # Business Logic (dse_service.py, chatbot_service.py)
│   │   └── main.py            # API Gateway Core & CORS Rules
│   ├── requirements.txt       # Python Libraries
│   └── .env                   # Configuration / Secret Keys
│
├── frontend/                  # React + TypeScript Client
│   ├── src/
│   │   ├── components/        # Chart, Header, Ticker, Chatbot UI
│   │   ├── hooks/             # Responsive React Hooks
│   │   ├── routes/            # TanStack Root and Index views
│   │   └── main.tsx           # Application Entry Point
│   └── package.json           # Node Packages
│
└── .gitignore                 # Workspace Repository Filters
```

---

## 🚀 Setup & Installation

### 1. Backend Server Setup

```bash
# Navigate to backend
cd Backend

# Create a clean virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows PowerShell:
.\.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

Create a `.env` file inside the `Backend/` directory:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
*(Note: If no API key is specified, the server automatically boots into a simulation fallback mode, ensuring beautiful data outputs remain functional).*

Launch the backend hot-reloader:
```bash
uvicorn app.main:app --reload
```
The backend API documentation is now live at `http://127.0.0.1:8000/docs`.

---

### 2. Frontend Client Setup

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install Node modules
npm install

# Run the Vite Dev server
npm run dev
```

Open `http://localhost:5173/` in your browser.

---

## 🛡️ Regulatory Specifications Standardized in SenseAI
* **Circuit Breakers:** Price movement caps ranging from **10%** (for shares under Tk. 200) down to **3.75%** (above Tk. 5000) to control speculative spikes.
* **Capital Gains Tax (CGT):** Flat **15%** tax on capital gains realized above **Tk. 50 Lakh** in a financial year.
* **Margin Loan Ratios:** Maximum 1:1 leverage ratio allowed. Margin accounts are restricted for students, retirees, and low-income entities to safeguard retail investors.
* **Settlement Schedules:** Category A/B/N stocks settle on **T+2** cycles, while speculative Category Z shares settle on **T+3** cycles.

---

## 📄 License
This project is developed under academic rules for **CSE499A** at North South University. 

*Disclaimer: Stock market investments are subject to market risks. StockSenseAI and SenseAI provide informational summaries and do not represent direct financial guarantees.*

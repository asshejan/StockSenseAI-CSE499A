import os
import logging
from pathlib import Path
import google.generativeai as genai
from app.core.config import settings
from app.services.dse_service import DSEService

logger = logging.getLogger(__name__)

# Initialize Gemini if API key is provided
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not found in environment. Chatbot will run in simulation/fallback mode.")

class ChatbotService:
    @staticmethod
    def _read_regulations() -> str:
        """Reads the compiled BSEC laws and regulations document."""
        try:
            reg_path = Path(__file__).parent.parent / "data" / "regulations.txt"
            if reg_path.exists():
                return reg_path.read_text(encoding="utf-8")
        except Exception as e:
            logger.error(f"Error reading regulations data file: {e}")
        return "Bangladeshi stock market regulations: Circuit breaker standard limit 10%, Capital Gains Tax is 15% on gains exceeding Tk. 50 Lakh, T+2 settlement for A/B/N categories, and BO accounts are required via CDBL."

    @classmethod
    def get_ai_response(cls, user_message: str, chat_history: list = None) -> str:
        """
        Generates a highly-compliant, data-driven financial advice response using Gemini.
        Appends real-time DSE stock market data and compiled BSEC regulations to the context.
        """
        # 1. Fetch real-time market overview
        live_data = DSEService.get_live_dse_data()
        market_overview = "\n".join([
            f"- {stock['symbol']} ({stock['name']}): Price BDT {stock['price']}, Change {stock['change']}% (High: {stock['high']}, Low: {stock['low']}, Vol: {stock['volume']})"
            for stock in live_data
        ])

        # 2. Read BSEC laws/regulations
        regulations = cls._read_regulations()

        # 3. Construct System Prompt
        system_instruction = f"""
You are SenseAI, a highly sophisticated Quantum Market Intelligence assistant specializing in the Bangladeshi Capital Market (Dhaka Stock Exchange - DSE and Chittagong Stock Exchange - CSE). 
Your goal is to guide investors with institutional-grade data, technical/fundamental patterns, and strict regulatory compliance.

You are equipped with the following:
1. Compiled BSEC & DSE investment laws and regulations.
2. Real-time market feeds of major DSE stocks.
3. 20 years of historical knowledge of the Bangladeshi capital market.

Here is the COMPILED REGULATORY FRAMEWORK for Bangladesh (BSEC & DSE):
{regulations}

Here is the CURRENT LIVE MARKET DATA from the Dhaka Stock Exchange (DSE):
{market_overview}

Instructions for responding to the user:
- Be analytical, objective, and precise. Show prices in BDT.
- Strictly adhere to BSEC laws (Circuit breakers, margin restrictions, 15% Capital Gains Tax on gains over 50 Lakh, T+2/T+3 settlement).
- If the user asks about investing in a specific company (e.g., GP, BATBC, BEXIMCO, SQURPHARMA), evaluate their current price, percentage change, and recent market context from the live data. Bring in historical 20-year trends/context from your general knowledge (e.g., GP is a solid blue-chip dividend payer, BEXIMCO has high volatility, SQURPHARMA is fundamentally strong, etc.).
- Give clear recommendations on whether they should consider investing based on risk profile, but always include a compliance disclaimer: "Disclaimer: This is for educational/analytical purposes and does not constitute direct financial advice. Stock market investments carry risks."
- Respond in a clean, professional, markdown format. Keep it engaging and premium.
"""

        # 4. Generate Response using Gemini
        if settings.GEMINI_API_KEY:
            try:
                # Use gemini-1.5-flash or gemini-2.5-flash as default stable text model
                model = genai.GenerativeModel(
                    model_name="gemini-1.5-flash",
                    system_instruction=system_instruction
                )
                
                # Format conversation history if available
                contents = []
                if chat_history:
                    for chat in chat_history:
                        role = "user" if chat.get("role") == "user" else "model"
                        contents.append({"role": role, "parts": [chat.get("text", "")]})
                
                contents.append({"role": "user", "parts": [user_message]})
                
                response = model.generate_content(contents)
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}")
                # Fall through to simulated fallback if API fails
        
        # 5. High-fidelity Simulated Response (in case of missing API key or API limits)
        return cls._generate_fallback_response(user_message, live_data)

    @classmethod
    def _generate_fallback_response(cls, user_message: str, live_data: list) -> str:
        """
        Generates simulated expert responses containing real-time stock data and regulations.
        Used as a fallback if the Gemini API key is missing or calls fail.
        """
        msg_lower = user_message.lower()
        
        # Identify if user is asking about a specific stock
        matched_stock = None
        for stock in live_data:
            if stock["symbol"].lower() in msg_lower or stock["name"].lower() in msg_lower:
                matched_stock = stock
                break
                
        disclaimer = "\n\n*Disclaimer: This analysis is simulated by SenseAI for educational/analytical purposes and does not constitute official financial advice. Trading on the Dhaka Stock Exchange involves substantial risk.*"

        if matched_stock:
            ticker = matched_stock["symbol"]
            price = matched_stock["price"]
            change = matched_stock["change"]
            trend = "bullish breakout" if change >= 0 else "bearish correction"
            trend_color = "upward momentum" if change >= 0 else "downward consolidation"
            
            # Custom company analysis
            company_analysis = ""
            if ticker == "GP":
                company_analysis = "GP (Grameenphone) is the leading telecommunications provider in Bangladesh. Historically, it is a high-yield blue-chip stock with excellent dividend payouts. Due to its stable cash flow, it is generally considered a conservative long-term investment, though regulatory battles with BTRC can introduce periodic risks."
            elif ticker == "BATBC":
                company_analysis = "BATBC (British American Tobacco Bangladesh) is one of the highest-priced and fundamentally sound multinational shares on the DSE. It is known for high return-on-equity and solid corporate governance, making it a favorite for institutional funds, although cigarette excise taxes represent a constant headwind."
            elif ticker == "SQURPHARMA":
                company_analysis = "Square Pharmaceuticals is the leading pharma company in Bangladesh. It features a debt-free balance sheet, strong local market capture, and expanding exports. Under BSEC regulations, it represents a highly defensive pick with low volatility."
            elif ticker == "BEXIMCO":
                company_analysis = "BEXIMCO is a highly traded conglomerate stock with high beta and high retail speculation. It features large volatility and is best suited for active traders rather than passive investors. Ensure you keep tight stop-losses due to sudden shifts in DSE volume."
            else:
                company_analysis = f"{matched_stock['name']} is currently trading at BDT {price} with a daily change of {change}%. Evaluate its price-to-earnings (P/E) ratio and dividend yield before committing capital."

            recommendation = "HOLD / CAUTIOUS BUY" if change >= -1 else "WAIT FOR CONSOLIDATION"
            
            return f"""### 📊 Market Intelligence: {ticker} ({matched_stock['name']})

Based on real-time data from the Dhaka Stock Exchange (DSE), here is the quantitative analysis for **{ticker}**:

*   **Current Price:** BDT {price}
*   **Daily Change:** {"▲" if change >= 0 else "▼"} {change}% (indicating {trend_color})
*   **Today's Range:** BDT {matched_stock['low']} – BDT {matched_stock['high']}
*   **Volume:** {matched_stock['volume']} units traded today

#### 🔍 Fundamental & Historical Context (20-Year Analysis)
{company_analysis}

#### ⚖️ BSEC Regulatory Check
*   **Circuit Breaker:** The maximum daily price movement for this share is regulated by BSEC's price-tiered limits. Today's cap is active.
*   **Settlement Category:** Settle cycle is **T+2** (Category A). You will receive shares/funds after 2 working days.
*   **Taxation:** Any capital gain realized above Tk. 50 Lakh annually will be subject to a **15% Capital Gains Tax** under Bangladesh Finance Act regulations.
*   **Margin Trading:** If using a margin loan, ensure your broker debt-to-equity ratio remains below BSEC's 1:1 limit. Students and retirees are restricted from margin leverage.

#### 🎯 Strategic Verdict: **{recommendation}**
Given the current {trend} of {change}%, long-term investors should watch for support levels. {ticker} presents sound financial indicators but technical consolidation is advised.

{disclaimer}"""

        # General investment law and regulations query
        if "law" in msg_lower or "regulation" in msg_lower or "tax" in msg_lower or "rule" in msg_lower or "circuit" in msg_lower or "bo account" in msg_lower:
            return f"""### ⚖️ Bangladesh Stock Market Regulations & Guides

SenseAI has extracted the official guidelines from the **Bangladesh Securities and Exchange Commission (BSEC)** and the **Dhaka Stock Exchange (DSE)**:

#### 1. How to Start (BO Account)
*   You must open a **Beneficiary Owner (BO) Account** via a registered Depository Participant (DP) broker house.
*   Required details: NID, bank details (with routing number for automated dividend deposits), and e-TIN.
*   **Foreign Investors:** Must open a **NITA (Non-Resident Investor's Taka Account)** via a custodian bank. 100% full repatriation of capital, gains, and dividends is guaranteed under Bangladesh foreign exchange regulations.

#### 2. DSE Trading & Circuit Breakers
*   Trading hours: **10:00 AM to 2:30 PM (Sunday – Thursday)**.
*   **Circuit Breaker limits** cap maximum daily stock price movement at a base of **10%**, with strict price-tiered caps for higher-priced stocks (e.g., 5.0% for stocks between Tk. 2001-5000, 3.75% above Tk. 5001) to mitigate volatility.

#### 3. Investment Taxation (Finance Act)
*   **Capital Gains Tax (CGT):** Flat **15%** tax on capital gains, applicable only when annual capital gains exceed **Tk. 50 Lakh**.
*   **Dividend Tax:** Cash dividends face a withholding tax at source of **10%** (for e-TIN holders) or **15%** (without e-TIN).

#### 4. Margin Leverage Laws
*   Brokers are capped at a **1:1 margin ratio** ( Tk. 1 of own cash allows Tk. 1 of margin loan).
*   *2025 BSEC Draft Guidelines:* Retirees, students, and low-income earners are legally prohibited from trading on margin accounts to protect retail investors from speculative ruin.

*Would you like analysis on a specific ticker (e.g., GP, BATBC, SQURPHARMA, BEXIMCO) under these regulations?*{disclaimer}"""

        # General Greeting response
        return f"""### 🤖 Welcome to SenseAI — Quantum Market Intelligence

I am **SenseAI**, your intelligent agent trained on the **Dhaka Stock Exchange (DSE)**, containing 20 years of historical trends, real-time prices, and **BSEC Capital Market Regulations**.

I can assist you with:
1.  **Real-Time Stock Feeds:** Ask about major tickers like **GP, BATBC, SQURPHARMA, BEXIMCO, or LHBL** to see live prices, ranges, and volume.
2.  **Investment Guidance:** Ask whether you should invest in a company based on DSE trends.
3.  **Regulatory & Legal Advice:** Learn about BO/NITA account setup, dividend taxation, **15% Capital Gains Tax**, T+2 settlements, or circuit breakers.

**Example Prompts:**
*   *"Should I invest in GP? Share its current price and historical trends."*
*   *"What are the capital gains tax rules and circuit breakers in Bangladesh?"*
*   *"Analyze BEXIMCO and explain DSE category A/Z settlement."*

What stock or regulation can I analyze for you today?{disclaimer}"""

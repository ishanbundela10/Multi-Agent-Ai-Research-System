# NexusAgent: Multi-Agent Autonomous Research System

An advanced autonomous research system powered by **Mistral AI**, **Tavily Web Search**, **BeautifulSoup4**, **FastAPI**, and a **React 19 + Tailwind CSS** frontend.

---

## 🌟 Architecture & Agent Flow

The system orchestrates 4 specialized AI agents and chains:

```
[User Topic]
      │
      ▼
┌───────────────────────────┐
│ 1. Web Explorer Agent     │  -> Formulates targeted search queries & searches web via Tavily
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ 2. Deep Reader Agent      │  -> Analyzes top URLs & scrapes deep article text via BeautifulSoup
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ 3. Synthesis Writer Agent │  -> Synthesizes findings into a structured report with sources
└─────────────┬─────────────┘
              ▼
┌───────────────────────────┐
│ 4. Quality Critic Agent   │  -> Rigorously evaluates draft, scores X/10, highlights strengths & gaps
└─────────────┬─────────────┘
              ▼
[Interactive Research Lab UI]
```

---

## 🚀 Quick Start Guide

### 1. Start Backend (FastAPI)

```bash
cd backend

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

# Ensure API keys are configured in backend/.env:
# MISTRAL_API_KEY=...
# TAVILY_API_KEY=...

# Run the API server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` with documentation at `http://localhost:8000/docs`.

### 2. Start Frontend (React + Vite)

In a separate terminal:

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# Start Vite development server
npm run dev
```

The application will launch at `http://localhost:5173`.

---

## 💻 Frontend Features

- **Live Agent Streaming (SSE)**: Real-time visual progress as each agent triggers and completes with live terminal messages.
- **Batch POST Mode**: Option for traditional synchronous API requests.
- **4-Stage Pipeline Stepper**: Interactive agent cards showing active states, pulse animations, elapsed time, and 1-click inspection.
- **Executive Report View**:
  - Formatted Markdown rendering with code blocks, tables, lists, and callouts.
  - One-click **Copy**, **Download .md**, and **Print / PDF export**.
  - Word count and estimated reading time.
  - Clickable external source reference tags.
- **Critic Scorecard**:
  - Circular/prominent quality score gauge (`X/10`) with dynamic color thresholds.
  - Structured Strengths and Areas for Improvement breakdown.
  - Highlighted Executive Verdict quote banner.
- **Agent Telemetry Inspector**:
  - Tab 1: Tavily Search results & URL snippets.
  - Tab 2: Scraped in-depth article body text.
  - Tab 3: Writer draft text.
  - Tab 4: Full JSON pipeline state with one-click copy.
- **Research Archive / History**:
  - Saved sessions stored in `localStorage`.
  - Instantly reload previous research reports and scores without re-running.
- **Live Health Monitor**: Automatic polling of `/health` with latency metrics.
- **Modern Glassmorphic Dark UI**: Built with Tailwind CSS v4, Lucide React icons, and accessible focus states.


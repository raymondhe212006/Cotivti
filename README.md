# MedQuorum

Agentic multi-stakeholder prior authorization analysis — Cotiviti Internship Assessment POC

## What it does

MedQuorum simulates a real-world prior authorization review by spinning up multiple AI personas (clinician, payer medical director, pharmacist, case manager, etc.) and having each independently evaluate a submitted proposal. The personas then see one another's positions, reassess their own stances, and a final consensus verdict is rendered.

**Pipeline:**
1. **Persona generation** — Claude derives relevant stakeholder roles from the proposal
2. **Initial reaction** — each persona independently analyzes the proposal and rates it
3. **Peer reassessment** — each persona reviews peers' positions and updates their stance
4. **Final consensus** — a synthesized verdict with approval recommendation and rationale

## Tech stack

- **Backend:** Node.js + Express, Anthropic Claude API (`claude-sonnet-4-5`)
- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **AI orchestration:** parallel `Promise.all` calls across personas, structured JSON outputs via Claude tool use

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your Anthropic API key
echo "ANTHROPIC_API_KEY=sk-..." > .env

# 3. Start the web server
npm run web
# → http://localhost:8080
```

## Usage

1. Paste a prior authorization request into the left panel (or click **Load sample proposal**)
2. Optionally add specific stakeholder roles under **Role Requests**
3. Click **Run Simulation**
4. Review each persona's initial reaction, reassessment, and the final consensus verdict

## Project structure

```
.
├── index.js          # Core pipeline: persona creation → reactions → reassessment → verdict
├── calls.js          # Claude API calls (createPersonas, simulate_persona, reassess, final_concensus)
├── server.js         # Express server + /api/run and /api/sample endpoints
├── public/
│   └── index.html    # Single-page frontend
├── prompts.json      # System prompts for each pipeline stage
├── sample_proposal.txt
└── test_input.json   # Sample proposal loaded via "Load sample proposal"
```

## Relevant topic

**Clinical Decision Making and Pattern Recognition in Health Care** — specifically demonstrating agentic generative AI for prior authorization review across the treatment, payment, and operations (TPO) dimension.

# Local AI Finance Tracker

A personal finance app that automatically pulls bank transactions via Plaid and categorizes them using a local LLM. All data stays on your machine — no cloud AI APIs, no data sharing.

## How It Works

### Transaction Sync

Plaid connects to your bank and pulls transactions. The sync pipeline processes them in three phases:

1. **Build** — Fetches new transactions from Plaid, skips duplicates
2. **Enrich** — Classifies each transaction using a local LLM (parallelized across threads)
3. **Persist** — Writes transactions and merchant mappings to the database in a single atomic commit

### Intelligent Classification

Classification uses a 2-stage LLM pipeline to reduce hallucinations:

- **Stage 1**: Extracts the merchant name and selects a parent category from a flat list (the model never sees subcategories, so it can't confuse the hierarchy)
- **Stage 2**: Given the parent category, selects the most specific subcategory from a scoped list

### Merchant Caching

The system learns from every transaction it classifies. When a new merchant is encountered, the LLM classifies it and the result is cached in a merchant database. Future transactions from the same merchant skip the LLM entirely — category assignment is instant.

This means:
- **First sync**: LLM calls scale with unique merchants, not total transactions (18 transactions from 6 merchants = 6 classifications, not 18)
- **Subsequent syncs**: Most transactions hit the cache. Only genuinely new merchants trigger LLM calls.
- **Intra-batch deduplication**: Multiple transactions with the same description in a single sync are classified once

### Hierarchical Categories

Categories are organized in a parent/subcategory hierarchy (e.g., Food > Coffee Shops, Transportation > Ride Share / Taxi). Default categories are seeded on startup covering housing, utilities, food, transportation, health, subscriptions, travel, and more.

## Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Bank Sync**: Plaid API
- **Transaction Enrichment**: Ollama (gemma4:e4b) — runs locally, no API keys needed
- **Frontend**: React + Vite + TypeScript + Tailwind CSS

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Ollama](https://ollama.com/) (local LLM runtime)
- [Node.js](https://nodejs.org/) (for the frontend)
- A [Plaid](https://plaid.com/) account (sandbox or production)

## Getting Started

All `make` commands run from the `server/` directory.

### 1. Start infrastructure

```sh
make docker-up    # Start PostgreSQL + Ollama
```

### 2. Configure environment

Copy and fill in `server/.env`:

```
DATABASE_URL=postgresql://finance:finance@localhost:5432/finance
SECRET_KEY=change-me-in-production
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
```

### 3. Pull the LLM model

```sh
make ollama-pull  # Pull gemma4:e4b
```

Make sure `ollama serve` is running locally.

### 4. Run migrations and seed data

```sh
make migrate      # Create database tables + seed default categories
make seed         # Seed budget data
```

### 5. Link a bank account

```sh
make link-account  # Opens Plaid Link in your browser
```

### 6. Sync transactions

```sh
make sync          # Pull and enrich transactions from all linked accounts
```

### 7. Start the API and frontend

```sh
make api           # Start the API server at http://localhost:8000
cd ../client && npm run dev  # Start the frontend at http://localhost:5173
```

API docs available at http://localhost:8000/docs.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | — | PostgreSQL connection string |
| `PLAID_CLIENT_ID` | — | Plaid API client ID |
| `PLAID_SECRET` | — | Plaid API secret |
| `PLAID_ENV` | `sandbox` | Plaid environment |
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `gemma4:e4b` | LLM model for classification |
| `ENRICHMENT_WORKERS` | `4` | Thread pool size for parallel classification |

## Makefile Reference

| Command | Description |
|---|---|
| `make docker-up` | Start all Docker services |
| `make docker-down` | Stop all Docker services |
| `make docker-clean` | Stop services and delete volumes (fresh DB) |
| `make docker-restart` | Restart all services |
| `make docker-logs` | Tail logs from all services |
| `make docker-ps` | Show container status |
| `make db` | Start only PostgreSQL |
| `make migrate` | Run database migrations + seed default categories |
| `make migration msg="..."` | Generate a new migration |
| `make seed` | Seed budget data |
| `make reset-db` | Drop all tables and re-run migrations from scratch |
| `make api` | Start the FastAPI dev server |
| `make ollama-pull` | Pull the LLM model |
| `make link-account` | Link a bank account via Plaid |
| `make sync` | Sync and enrich transactions |
| `make reset-sync` | Delete synced transactions and reset cursors |

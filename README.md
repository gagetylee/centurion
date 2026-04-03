# Personal Finance

A personal finance app that automatically pulls bank transactions via Plaid and categorizes them using a local LLM.

## Stack

- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Bank Sync**: Plaid API
- **Transaction Enrichment**: Ollama (Qwen3 30B) for auto-categorization, merchant extraction, and recurring detection
- **Frontend**: React + Vite (TypeScript)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Ollama](https://ollama.com/) (local LLM runtime)
- [Node.js](https://nodejs.org/) (for the frontend)
- A [Plaid](https://plaid.com/) account (sandbox or production)

## Setup

All `make` commands run from the `server/` directory.

### 1. Start infrastructure

```sh
make docker-up    # Start PostgreSQL
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

### 3. Run migrations and seed data

```sh
make migrate      # Create database tables
make seed         # Seed budget categories
```

### 4. Set up Ollama

```sh
make ollama-pull  # Pull the Qwen3 30B model
```

Make sure `ollama serve` is running locally.

### 5. Link a bank account

```sh
make link-account  # Opens Plaid Link in your browser
```

### 6. Sync transactions

```sh
make sync          # Pull and enrich transactions from all linked accounts
```

## Running the API

```sh
make api           # Start the dev server at http://localhost:8000
```

API docs available at http://localhost:8000/docs.

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
| `make migrate` | Run database migrations |
| `make migration msg="..."` | Generate a new migration |
| `make seed` | Seed budget categories |
| `make api` | Start the FastAPI dev server |
| `make ollama-pull` | Pull the LLM model |
| `make link-account` | Link a bank account via Plaid |
| `make sync` | Sync and enrich transactions |
| `make reset-sync` | Delete synced transactions and reset cursors |

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal finance app that syncs bank transactions via Plaid and auto-categorizes them using a local LLM (Ollama). Monorepo with a FastAPI backend (`server/`) and React frontend (`client/`).

## Common Commands

All `make` commands run from `server/`.

### Server
```sh
cd server
make api              # Start dev server (uvicorn --reload) at :8000
make docker-up        # Start PostgreSQL + Ollama via docker-compose
make migrate          # Run alembic migrations + seed default categories
make migration msg="description"  # Generate new migration (always use --autogenerate, never hand-write)
make sync             # Sync and enrich transactions from Plaid
make link-account     # Link a bank account via Plaid
```

### Client
```sh
cd client
npm run dev           # Vite dev server at :5173
npm run build         # TypeScript check + Vite build
npm run lint          # ESLint
```

## Architecture

### Backend (`server/app/`)

Layered architecture using FastAPI dependency injection:

- **Routers** (`routers/`) — HTTP endpoints. Each router maps to a resource (accounts, transactions, categories, budgets, plaid).
- **Services** (`services/`) — Business logic. Instantiated per-request via FastAPI `Depends()` in `dependencies.py`.
- **Repositories** (`repositories/`) — Database access abstraction (currently only `TransactionRepository`; other services query SQLAlchemy directly).
- **Clients** (`clients/`) — External API wrappers: `PlaidClient` for bank sync, `OllamaClient` for LLM calls.
- **Schemas** (`schemas/`) — Pydantic models for request/response validation.
- **DB Models** (`db/models/`) — SQLAlchemy ORM models. `Base` from `db/database.py`.
- **Migrations** (`db/alembic/`) — Alembic migrations. Config in `server/alembic.ini`, script location is `app/db/alembic`.

Key data flow for transaction sync: `BankService` orchestrates Plaid sync → `TransactionRepository` persists → `ClassificationService` uses `OllamaClient` for 2-stage LLM categorization (category → subcategory).

DI wiring is centralized in `dependencies.py` — all service/client construction happens there.

### Frontend (`client/src/`)

React 19 + TypeScript + Vite + Tailwind CSS v4.

- **State**: Zustand store (`store/transactionStore.ts`)
- **API**: Thin fetch wrapper in `lib/api.ts`, base URL from `VITE_API_URL` env var (defaults to `localhost:8000`)
- **UI**: shadcn/ui components in `components/ui/`, page components organized by feature (dashboard, expenses, budgets, settings)
- **Routing**: react-router-dom

### Infrastructure

- `docker-compose.yml` at repo root: PostgreSQL 17, Ollama, and the server container
- Config via `server/.env` (loaded by `app/config.py` using python-dotenv)
- Python managed with `uv`, Node managed with npm

## Conventions

- Use `logging` module, not `print()`, in server code
- Never hand-write Alembic migrations — always use `make migration msg="..."` which runs `alembic revision --autogenerate`
- LLM model configured via `OLLAMA_MODEL` env var (default: `gemma4:31b`)

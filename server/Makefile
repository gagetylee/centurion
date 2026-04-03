.PHONY: help docker-up docker-down docker-clean docker-restart docker-logs docker-ps db migrate migration seed api link-account sync reset-sync ollama-pull

.DEFAULT_GOAL := help

help:
	@echo "Usage: make <target>"
	@echo ""
	@echo "Infrastructure:"
	@echo "  docker-up        Start all containers"
	@echo "  docker-down      Stop all containers"
	@echo "  docker-clean     Stop containers and remove volumes"
	@echo "  docker-restart   Restart all containers"
	@echo "  docker-logs      Tail container logs"
	@echo "  docker-ps        List running containers"
	@echo ""
	@echo "LLM:"
	@echo "  ollama-pull      Pull qwen3:30b model"
	@echo ""
	@echo "Database:"
	@echo "  db               Start database container only"
	@echo "  migrate          Run alembic migrations + seed default categories"
	@echo "  migration        Create migration (msg=\"description\")"
	@echo "  seed             Seed budget data"
	@echo ""
	@echo "Server:"
	@echo "  api              Start dev server with hot reload"
	@echo ""
	@echo "Scripts:"
	@echo "  link-account     Link a bank account via Plaid"
	@echo "  sync             Sync transactions from Plaid"
	@echo "  reset-sync       Reset sync state"

# Infrastructure
docker-up:
	docker compose -f ../docker-compose.yml up -d

docker-down:
	docker compose -f ../docker-compose.yml down

docker-clean:
	docker compose -f ../docker-compose.yml down -v

docker-restart:
	docker compose -f ../docker-compose.yml restart

docker-logs:
	docker compose -f ../docker-compose.yml logs -f

docker-ps:
	docker compose -f ../docker-compose.yml ps

# LLM
ollama-pull:
	ollama pull gemma4:e4b

# Database
db:
	docker compose -f ../docker-compose.yml up -d db

migrate:
	uv run alembic upgrade head
	uv run python -c "from app.db.seed import seed_default_categories; seed_default_categories()"

migration:
	uv run alembic revision --autogenerate -m "$(msg)"

seed:
	uv run python -m app.db.seed_budget

# Server
api:
	uv run uvicorn app.main:app --reload

# Scripts
link-account:
	uv run python -m scripts.link_account

sync:
	uv run python -m scripts.sync_transactions

reset-sync:
	uv run python -m scripts.reset_sync

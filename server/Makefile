.PHONY: docker-up docker-down docker-clean docker-restart docker-logs docker-ps db migrate migration seed api link-account sync reset-sync ollama-pull

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
	ollama pull qwen3:30b

# Database
db:
	docker compose -f ../docker-compose.yml up -d db

migrate:
	uv run alembic upgrade head

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

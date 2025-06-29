BACKEND_PATH=backend
FRONTEND_PATH=frontend

start-backend:
	@echo "Starting FastAPI backend..."
	cd $(BACKEND_PATH) && uvicorn src.main:app --reload

start-frontend:
	@echo "Starting Next.js frontend..."
	cd $(FRONTEND_PATH) && npx next dev

start:
	@echo "Starting both backend and frontend..."
	make start-backend & make start-frontend

docker-start:
	@echo "Starting both backend and frontend with docker..."
	docker-compose up

stop:
	@echo "Stopping all backend and frontend processes..."
	lsof -ti:8000 | xargs kill -9 || true
	lsof -ti:3000 | xargs kill -9 || true

stop-docker:
	@echo "Stopping all backend and frontend processes..."
	docker-compose down

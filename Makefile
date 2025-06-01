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

stop:
	@echo "Stopping all backend and frontend processes..."
	pkill -f "uvicorn src.main:app --reload" || true
	pkill -f "npx next dev" || true
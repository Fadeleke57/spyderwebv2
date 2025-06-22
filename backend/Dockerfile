# use a slim Python base image
FROM python:3.13-slim

# set working directory
WORKDIR /app

# Install dependencies as root
RUN apt-get update && \
    apt-get install -y build-essential gcc libfreetype6-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip & install pymupdf early
RUN pip install --upgrade pip && \
    pip install pymupdf

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all app files as root
COPY src/ ./src/
COPY tests/ ./tests/
COPY *.py ./
COPY *.json ./

# Create non-root user AND adjust ownership
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Switch to non-root
USER appuser

EXPOSE 8000

# start FastAPI app with Uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--reload"]

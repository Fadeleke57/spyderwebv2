FROM python:3.11-slim

# set working directory
WORKDIR /app

# install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# copy requirements first for better caching
COPY requirements.txt .

# install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# copy source code
COPY src/ ./src/
COPY tests/ ./tests/
COPY *.py ./
COPY *.sh ./
COPY *.json ./

# make shell scripts executable
RUN chmod +x *.sh

# create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# expose port
EXPOSE 8000

# command to run the application
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

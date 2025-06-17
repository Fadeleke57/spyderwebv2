# use a slim Python base image
FROM python:3.13-slim-bullseye

# set working directory
WORKDIR /app

RUN apt update && apt install -y \
    build-essential \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# copy requirements file early for Docker cache
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

# create non-root user and assign ownership
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# expose FastAPI port
EXPOSE 8000

# run the startup script
ENTRYPOINT ["./start.sh"]

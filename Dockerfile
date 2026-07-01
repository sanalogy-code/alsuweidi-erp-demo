FROM python:3.12-slim

WORKDIR /app

# Copy requirements first
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY backend/app ./app

# Set default port (Railway will override via environment)
ENV PORT=8000

FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY src/ ./src/

# Expose port
EXPOSE 8000

# Default port (Railway will override with $PORT)
ENV PORT=8000

# Start command using shell to interpret $PORT
CMD uvicorn src.agent:app --host 0.0.0.0 --port $PORT

FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Railway injects PORT; use serve.py so binding does not rely on shell expansion.
# If Railway "Custom Start Command" is set, remove it or use: python serve.py
CMD ["python", "serve.py"]

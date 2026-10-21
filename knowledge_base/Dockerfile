FROM python:3-alpine
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv
WORKDIR /app
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt
COPY server.py ./
COPY app app
EXPOSE 8090
CMD ["python", "-u", "server.py"]

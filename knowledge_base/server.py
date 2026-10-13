"""Serviço de dados: serve os CSV da knowledge base e faz CRUD sobre os utilizadores.

GET    /movies.csv, /users.csv   ficheiros tal como estão (lidos pelos motores e pelo front)
GET    /users                    lista de utilizadores (JSON, uma chave por coluna do CSV)
GET    /users/{id}               um utilizador
POST   /users                    cria
PUT    /users/{id}               substitui (o user_id pode mudar)
DELETE /users/{id}               apaga

O serviço não interpreta os valores das colunas: guarda texto. Quem valida o
conteúdo são os motores, ao recarregar o CSV.
"""
import csv
import json
import os
import re
import tempfile
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote

DATA_DIR = os.environ.get("DATA_DIR", "/data")
PORT = int(os.environ.get("PORT", "8090"))
USERS_FILE = os.path.join(DATA_DIR, "users.csv")
FILES = {"/users.csv": "users.csv", "/movies.csv": "movies.csv"}

write_lock = threading.Lock()


class ApiError(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message


def read_users():
    with open(USERS_FILE, newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        return reader.fieldnames, list(reader)


def write_users(columns, rows):
    # Escreve num ficheiro temporário e troca, para nunca deixar o CSV a meio.
    descriptor, temp_path = tempfile.mkstemp(dir=DATA_DIR, suffix=".tmp")
    with os.fdopen(descriptor, "w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    os.replace(temp_path, USERS_FILE)


def to_row(body, columns):
    """Valida o corpo do pedido e devolve uma linha com todas as colunas."""
    if not isinstance(body, dict):
        raise ApiError(400, "O corpo tem de ser um objeto JSON")
    unknown = set(body) - set(columns)
    if unknown:
        raise ApiError(400, f"Colunas desconhecidas: {', '.join(sorted(unknown))}")
    row = {column: "" if body.get(column) is None else str(body[column]) for column in columns}
    if not row["user_id"].strip():
        raise ApiError(400, "user_id é obrigatório")
    return row


def find(rows, user_id):
    for index, row in enumerate(rows):
        if row["user_id"] == user_id:
            return index
    raise ApiError(404, "Utilizador não encontrado")


class Handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send(204)

    def do_GET(self):
        self.handle_request()

    def do_POST(self):
        self.handle_request()

    def do_PUT(self):
        self.handle_request()

    def do_DELETE(self):
        self.handle_request()

    def handle_request(self):
        try:
            path = self.path.split("?")[0]
            if self.command == "GET" and path in FILES:
                return self.send_file(FILES[path])
            if path == "/users" and self.command in ("GET", "POST"):
                return self.users_collection()
            match = re.fullmatch(r"/users/([^/]+)", path)
            if match and self.command in ("GET", "PUT", "DELETE"):
                return self.users_item(unquote(match.group(1)))
            raise ApiError(404, "Não encontrado")
        except ApiError as error:
            self.send(error.status, {"error": error.message})
        except ValueError as error:
            self.send(400, {"error": str(error)})

    def users_collection(self):
        with write_lock:
            columns, rows = read_users()
            if self.command == "GET":
                return self.send(200, rows)
            row = to_row(self.read_body(), columns)
            if any(item["user_id"] == row["user_id"] for item in rows):
                raise ApiError(409, "user_id já existe")
            write_users(columns, rows + [row])
        self.send(201, row)

    def users_item(self, user_id):
        with write_lock:
            columns, rows = read_users()
            index = find(rows, user_id)
            if self.command == "GET":
                return self.send(200, rows[index])
            if self.command == "DELETE":
                del rows[index]
                write_users(columns, rows)
                return self.send(204)
            row = to_row(self.read_body(), columns)
            if row["user_id"] != user_id and any(item["user_id"] == row["user_id"] for item in rows):
                raise ApiError(409, "user_id já existe")
            rows[index] = row
            write_users(columns, rows)
        self.send(200, row)

    def read_body(self):
        length = int(self.headers.get("Content-Length") or 0)
        return json.loads(self.rfile.read(length) or b"null")

    def send_file(self, name):
        try:
            with open(os.path.join(DATA_DIR, name), "rb") as file:
                content = file.read()
        except FileNotFoundError:
            raise ApiError(404, "Ficheiro não encontrado")
        self.send(200, content, "text/csv; charset=utf-8")

    def send(self, status, body=None, content_type="application/json; charset=utf-8"):
        if body is not None and not isinstance(body, bytes):
            body = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        # CORS aberto: serviço de desenvolvimento, sem credenciais.
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        if body is not None:
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
        else:
            self.send_header("Content-Length", "0")
        self.end_headers()
        if body is not None:
            self.wfile.write(body)


if __name__ == "__main__":
    print(f"Serviço de dados em :{PORT} (ficheiros em {DATA_DIR})", flush=True)
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()

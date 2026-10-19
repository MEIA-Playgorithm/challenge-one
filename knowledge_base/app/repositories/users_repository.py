"""Utilizadores: leitura e CRUD."""
import csv
import os
import tempfile

from app.core.errors import ApiError
from app.repositories.csv_repository import CsvRepository


class UsersRepository(CsvRepository):
    def __init__(self, directory):
        super().__init__(directory, "users.csv", "user_id", "Utilizador")

    def create(self, body):
        with self.lock:
            columns, rows = self._read()
            row = self._to_row(body, columns)
            if any(item[self.key] == row[self.key] for item in rows):
                raise ApiError(409, "user_id já existe")
            self._write(columns, rows + [row])
            return row

    def update(self, key, body):
        with self.lock:
            columns, rows = self._read()
            index = self._index(rows, key)
            row = self._to_row(body, columns)
            if row[self.key] != key and any(item[self.key] == row[self.key] for item in rows):
                raise ApiError(409, "user_id já existe")
            rows[index] = row
            self._write(columns, rows)
            return row

    def delete(self, key):
        with self.lock:
            columns, rows = self._read()
            del rows[self._index(rows, key)]
            self._write(columns, rows)

    def _to_row(self, body, columns):
        """Valida o corpo do pedido e devolve uma linha com todas as colunas."""
        if not isinstance(body, dict):
            raise ApiError(400, "O corpo tem de ser um objeto JSON")
        unknown = set(body) - set(columns)
        if unknown:
            raise ApiError(400, f"Colunas desconhecidas: {', '.join(sorted(unknown))}")
        row = {column: "" if body.get(column) is None else str(body[column]) for column in columns}
        if not row[self.key].strip():
            raise ApiError(400, "user_id é obrigatório")
        return row

    def _write(self, columns, rows):
        # Escreve num ficheiro temporário e troca, para nunca deixar o CSV a meio.
        descriptor, temp_path = tempfile.mkstemp(dir=self.directory, suffix=".tmp")
        with os.fdopen(descriptor, "w", newline="", encoding="utf-8") as file:
            writer = csv.DictWriter(file, fieldnames=columns)
            writer.writeheader()
            writer.writerows(rows)
        os.replace(temp_path, self.path)

"""Acesso aos CSV. Só guardam texto: quem valida o conteúdo são os motores."""
import csv
import os
import threading

from app.core.errors import ApiError


class CsvRepository:
    """Leitura de um CSV com uma coluna-chave."""

    def __init__(self, directory, name, key, label):
        self.directory = directory
        self.path = os.path.join(directory, name)
        self.key = key
        self.label = label  # nome de um registo, para a mensagem de 404
        self.lock = threading.RLock()

    def raw(self):
        """O ficheiro tal como está."""
        try:
            with open(self.path, "rb") as file:
                return file.read()
        except FileNotFoundError:
            raise ApiError(404, "Ficheiro não encontrado")

    def all(self):
        with self.lock:
            return self._read()[1]

    def get(self, key):
        with self.lock:
            rows = self._read()[1]
            return rows[self._index(rows, key)]

    def _read(self):
        with open(self.path, newline="", encoding="utf-8") as file:
            reader = csv.DictReader(file)
            return reader.fieldnames, list(reader)

    def _index(self, rows, key):
        for index, row in enumerate(rows):
            if row[self.key] == key:
                return index
        raise ApiError(404, f"{self.label} não encontrado")

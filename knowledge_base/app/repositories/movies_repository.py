"""Catálogo de filmes."""
from app.repositories.csv_repository import CsvRepository


class MoviesRepository(CsvRepository):
    """Só leitura: o catálogo de filmes não tem escrita."""

    def __init__(self, directory):
        super().__init__(directory, "movies.csv", "id", "Filme")

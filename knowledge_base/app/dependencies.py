"""Uma instância de cada repositório, partilhada por todos os pedidos (o lock é da instância)."""
from functools import lru_cache
from typing import Annotated

from fastapi import Depends

from app.config import DATA_DIR
from app.repositories.movies_repository import MoviesRepository
from app.repositories.users_repository import UsersRepository


@lru_cache
def get_users() -> UsersRepository:
    return UsersRepository(DATA_DIR)


@lru_cache
def get_movies() -> MoviesRepository:
    return MoviesRepository(DATA_DIR)


# Para declarar o repositório como parâmetro de um endpoint: `users: Users`.
Users = Annotated[UsersRepository, Depends(get_users)]
Movies = Annotated[MoviesRepository, Depends(get_movies)]

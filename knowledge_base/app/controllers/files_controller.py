"""Os CSV tal como estão, lidos pelos motores e pelo front."""
from fastapi import APIRouter, Response

from app.dependencies import Movies, Users

router = APIRouter(tags=["files"])


def csv_response(content: bytes):
    return Response(content, media_type="text/csv; charset=utf-8")


@router.get("/users.csv", summary="O ficheiro users.csv", response_class=Response)
def users_csv(users: Users):
    return csv_response(users.raw())


@router.get("/movies.csv", summary="O ficheiro movies.csv", response_class=Response)
def movies_csv(movies: Movies):
    return csv_response(movies.raw())

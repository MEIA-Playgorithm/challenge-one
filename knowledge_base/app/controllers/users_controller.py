"""CRUD de utilizadores."""
from typing import Any

from fastapi import APIRouter, Response

from app.dependencies import Users

router = APIRouter(prefix="/users", tags=["users"])

# Uma chave por coluna do CSV, com valores em texto (listas separadas por "|").
UserBody = dict[str, Any]


@router.get("", summary="Lista os utilizadores")
def list_users(users: Users):
    return users.all()


@router.post("", status_code=201, summary="Cria um utilizador (409 se o user_id já existe)")
def create_user(user: UserBody, users: Users):
    return users.create(user)


@router.get("/{user_id}", summary="Um utilizador")
def get_user(user_id: str, users: Users):
    return users.get(user_id)


@router.put("/{user_id}", summary="Substitui um utilizador (o user_id pode mudar)")
def update_user(user_id: str, user: UserBody, users: Users):
    return users.update(user_id, user)


@router.delete("/{user_id}", status_code=204, summary="Apaga um utilizador")
def delete_user(user_id: str, users: Users):
    users.delete(user_id)
    return Response(status_code=204)

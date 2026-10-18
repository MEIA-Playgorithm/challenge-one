"""Estado do serviço."""
from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Verifica que o serviço está a funcionar")
def health():
    return {"status": "ok"}

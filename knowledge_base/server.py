"""Serviço de dados: serve os CSV da knowledge base e faz CRUD sobre os utilizadores.

GET    /health                   estado do serviço
GET    /movies.csv, /users.csv   ficheiros tal como estão (lidos pelos motores e pelo front)
GET    /users/{id}               um utilizador
POST   /users                    cria
PUT    /users/{id}               substitui (o user_id pode mudar)
DELETE /users/{id}               apaga

O serviço não interpreta os valores das colunas: guarda texto. Quem valida o
conteúdo são os motores, ao recarregar o CSV. Swagger em /docs.
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import DATA_DIR, PORT
from app.controllers import files_controller, health_controller, users_controller
from app.core.errors import register_errors

app = FastAPI(title="Playgorithm knowledge base")
# CORS aberto: serviço de desenvolvimento, sem credenciais.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])
register_errors(app)
app.include_router(health_controller.router)
app.include_router(files_controller.router)
app.include_router(users_controller.router)

if __name__ == "__main__":
    print(f"Serviço de dados em :{PORT} (ficheiros em {DATA_DIR})", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=PORT)

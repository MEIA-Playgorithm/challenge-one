# Knowledge base

Os CSV (`movies.csv`, `users.csv`) e o serviço que os serve. O front e os motores
(Prolog, Drools) não leem ficheiros: acedem a este serviço por HTTP.

```
GET    /movies.csv, /users.csv   ficheiros tal como estão
GET    /users                    lista de utilizadores (JSON, uma chave por coluna do CSV)
GET    /users/{id}               um utilizador
POST   /users                    cria (201; 409 se o user_id já existe)
PUT    /users/{id}               substitui (o user_id pode mudar)
DELETE /users/{id}               apaga (204)
```

O corpo de `POST`/`PUT` é um objeto JSON com os nomes das colunas do CSV e valores
em texto (listas separadas por `|`). O serviço não valida o conteúdo: quem o faz
são os motores, ao recarregar (`POST /api/reload/users` devolve 422 se o CSV for inválido).
Depois de gravar, é preciso pedir esse reload a cada motor; o front fá-lo.

Organização (FastAPI; Swagger em `/docs`, esquema em `/openapi.json`):

```
server.py                              arranque: app, CORS, erros e controllers
app/config.py                          DATA_DIR e PORT
app/dependencies.py                    uma instância de cada repositório
app/core/errors.py                     ApiError e handlers (corpo {"error": ...})
app/repositories/csv_repository.py     leitura de um CSV (base)
app/repositories/movies_repository.py  só leitura
app/repositories/users_repository.py   leitura e CRUD, escrita atómica
app/controllers/files_controller.py    GET /users.csv, /movies.csv
app/controllers/users_controller.py    CRUD de /users
```

Executar: `docker compose up --build` (porta 8090), ou localmente:

```
uv pip install -r knowledge_base/requirements.txt   # ou: pip install -r ...
DATA_DIR=knowledge_base PORT=8090 python knowledge_base/server.py
```

Os motores recebem o URL em `MOVIES_CSV` e `USERS_CSV`, por exemplo
`http://knowledge-base:8090/users.csv`. Aceitam também um caminho de ficheiro.

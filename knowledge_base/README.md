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

Executar: `docker compose up --build` (porta 8090), ou localmente
`DATA_DIR=knowledge_base PORT=8090 python knowledge_base/server.py`.
Só usa a biblioteca standard do Python.

Os motores recebem o URL em `MOVIES_CSV` e `USERS_CSV`, por exemplo
`http://knowledge-base:8090/users.csv`. Aceitam também um caminho de ficheiro.

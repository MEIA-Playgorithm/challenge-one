# Endpoints por microserviço

## Todos os endpoints

X = o serviço implementa o endpoint. A última coluna diz se o frontend o chama.

| Método | Endpoint | Prolog | Drools | Knowledge base | Frontend | Front chama |
| --- | --- | :-: | :-: | :-: | :-: | :-: |
| GET | `/api/health` | X | X | — | — | — |
| GET | `/api/filmes` | X | X | — | — | — |
| GET | `/api/filme` | X | X | — | — | — |
| GET | `/api/recomendacoes` | X | X | — | — | — |
| GET | `/api/recomendacoes_utilizador` | X | X | — | — | X |
| POST | `/api/reload` | X | X | — | — | — |
| POST | `/api/reload/users` | X | X | — | — | X |
| POST | `/api/reload/movies` | X | X | — | — | — |
| GET | `/api/how` | — | X | — | — | — |
| GET | `/api/why-not` | — | X | — | — | — |
| GET | `/api/trace` | — | X | — | — | — |
| GET | `/docs` | — | X | X | — | — |
| GET | `/swagger-ui/index.html` | — | X | — | — | — |
| GET | `/redoc` | — | — | X | — | — |
| GET | `/openapi.json` | — | X | X | — | — |
| GET | `/users.csv` | — | — | X | — | X |
| GET | `/movies.csv` | — | — | X | — | X |
| GET | `/users` | — | — | X | — | — |
| POST | `/users` | — | — | X | — | X |
| GET | `/users/{user_id}` | — | — | X | — | — |
| PUT | `/users/{user_id}` | — | — | X | — | X |
| DELETE | `/users/{user_id}` | — | — | X | — | X |
| GET | `/config.json` | — | — | — | X | X |

## O que a knowledge base já cobre

Para cada endpoint dos motores: o que devolve e o que a knowledge base devolve de equivalente. Cobre = devolve o mesmo
conteúdo, e não só uma rota parecida.

| Endpoint dos motores | O que devolve | A KB cobre? | Equivalente na KB | O que a KB não dá | Valores dos motores face ao CSV |
| --- | --- | :-: | --- | --- | --- |
| `GET /api/health` | `{"status": "ok"}` | Não | — (o healthcheck usa `GET /users.csv`) | O estado do serviço | — |
| `GET /api/filmes` | Página de filmes (`total`, `offset`, `limit`, `items`) com 28 campos; filtros `genre`, `pace`, `complexity` | **Parcial** | `GET /movies.csv`: os 100 filmes, com 19 campos, em CSV | 9 campos inferidos (`pace`, `complexity`, `violence`, `humor`, `audience`, `psychological_intensity`, `emotional_tone`, `themes`, `subgenre`), filtros, paginação e JSON | Prolog igual ao CSV em 1897 de 1900 valores; Drools em 1193 de 1900 |
| `GET /api/filme` | Um filme, com 28 campos | **Parcial** | A linha do filme em `GET /movies.csv` (não há `/movies/{id}`) | Os mesmos 9 campos inferidos e a pesquisa por `id` | igual ao anterior |
| `GET /api/recomendacoes` | Filmes parecidos com um filme, com `score` de 0 a 11 | Não | — | O cálculo da semelhança | — |
| `GET /api/recomendacoes_utilizador` | Recomendações de um utilizador (`score`, `status`, `reasons`, `score_breakdown`...) | Não | `GET /users/{user_id}` devolve o perfil (34 colunas em texto), não recomendações | Todo o cálculo | — |
| `POST /api/reload` | Relê os dois CSV | Não se aplica | — (a KB lê o ficheiro a cada pedido, não guarda cópia) | — | — |
| `POST /api/reload/users` | Relê o CSV dos utilizadores | Não se aplica | — (idem) | — | — |
| `POST /api/reload/movies` | Relê o CSV dos filmes | Não se aplica | — (idem) | — | — |
| `GET /api/how` | Como se chegou a uma recomendação | Não | — | A explicação | — |
| `GET /api/why-not` | Porque um filme não foi recomendado | Não | — | A explicação | — |
| `GET /api/trace` | Eventos das regras disparadas | Não | — | Os eventos | — |
| `GET /docs`, `/swagger-ui/index.html`, `/openapi.json` | A documentação do próprio motor | Não | `GET /docs`, `/openapi.json` da KB documentam só a KB | A documentação dos motores | — |

Dos 14 endpoints do Drools e dos 8 do Prolog, a KB cobre **parcialmente 2** (`/api/filmes` e `/api/filme`), e só nos 19 campos
do CSV. Os outros dependem de cálculo dos motores ou do estado deles. Nos 19 campos, o Prolog devolve os valores do CSV; o
Drools altera a duração, a nota e deixa vazios 7 campos (`vote`, `budget`, `win`, `nomination`, `oscar`, `filming_location`,
`production_company`).

## Por serviço

A coluna **Front** diz se o frontend chama o endpoint.

### Prolog (`:8081`)

| Método | Endpoint | O que faz | Parâmetros | Front |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Estado do serviço | — | — |
| GET | `/api/filmes` | Lista filmes, com filtros e paginação | `genre`, `pace`, `complexity`, `limit` (1–100, 20), `offset` (0) | — |
| GET | `/api/filme` | Um filme | `id` | — |
| GET | `/api/recomendacoes` | Filmes parecidos com um filme | `id`, `min_score` (0–11, 0), `limit` (1–100, 10) | — |
| GET | `/api/recomendacoes_utilizador` | Recomendações para um utilizador | `user_id`, `limit` (1–100, 10), `offset` (0) | usa |
| POST | `/api/reload` | Relê os dois CSV | — | — |
| POST | `/api/reload/users` | Relê o CSV dos utilizadores | — | usa |
| POST | `/api/reload/movies` | Relê o CSV dos filmes | — | — |

### Drools (`:8082`)

| Método | Endpoint | O que faz | Parâmetros | Front |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Estado do serviço | — | — |
| GET | `/api/filmes` | Lista filmes, com filtros e paginação | `genre`, `pace`, `complexity`, `limit` (1–100, 20), `offset` (0) | — |
| GET | `/api/filme` | Um filme | `id` | — |
| GET | `/api/recomendacoes` | Filmes parecidos com um filme | `id`, `min_score` (0–11, 0), `limit` (1–100, 10) | — |
| GET | `/api/recomendacoes_utilizador` | Recomendações para um utilizador | `user_id`, `limit` (1–100, 10), `offset` (0) | usa |
| POST | `/api/reload` | Relê os dois CSV | — | — |
| POST | `/api/reload/users` | Relê o CSV dos utilizadores | — | usa |
| POST | `/api/reload/movies` | Relê o CSV dos filmes | — | — |
| GET | `/api/how` | Como se chegou a uma recomendação | `user_id`, `movie` | — |
| GET | `/api/why-not` | Porque um filme não foi recomendado | `user_id`, `movie` | — |
| GET | `/api/trace` | Eventos das regras disparadas | `user_id`, `movie` (opcional) | — |
| GET | `/docs` | Swagger UI (redireciona) | — | — |
| GET | `/swagger-ui/index.html` | Swagger UI | — | — |
| GET | `/openapi.json` | Especificação OpenAPI | — | — |

### Knowledge base (`:8090`)

| Método | Endpoint | O que faz | Parâmetros | Front |
| --- | --- | --- | --- | --- |
| GET | `/users.csv` | O CSV dos utilizadores | — | usa |
| GET | `/movies.csv` | O CSV dos filmes | — | usa |
| GET | `/users` | Lista utilizadores em JSON | — | — |
| POST | `/users` | Cria um utilizador | corpo JSON com as colunas | usa |
| GET | `/users/{user_id}` | Um utilizador | `user_id` no caminho | — |
| PUT | `/users/{user_id}` | Substitui um utilizador (o id pode mudar) | `user_id` no caminho, corpo JSON | usa |
| DELETE | `/users/{user_id}` | Apaga um utilizador | `user_id` no caminho | usa |
| GET | `/docs` | Swagger UI | — | — |
| GET | `/redoc` | Documentação ReDoc | — | — |
| GET | `/openapi.json` | Especificação OpenAPI | — | — |

### Frontend (`:4173`)

| Método | Endpoint | O que faz | Parâmetros | Front |
| --- | --- | --- | --- | --- |
| GET | `/config.json` | Os URLs dos serviços; o front lê-o ao arrancar | — | lê |

## Resumo

| Serviço | Endpoints | Só neste serviço | O front usa |
| --- | :-: | --- | :-: |
| Prolog | 8 | nenhum | 2 |
| Drools | 14 | `/api/how`, `/api/why-not`, `/api/trace`, `/docs`, `/swagger-ui/index.html`, `/openapi.json` | 2 |
| Knowledge base | 10 | todos | 5 |
| Frontend | 1 | `/config.json` | 1 |

Os dois motores têm os mesmos 8 endpoints de dados. O Drools acrescenta as 3 explicações e a documentação. O front usa 10 dos 33 endpoints (contando cada serviço em separado):
`/api/recomendacoes_utilizador` e `/api/reload/users` (nos dois motores), 5 da knowledge base e o seu próprio `/config.json`.

# API HTTP

API do motor SWI-Prolog. Devolve sempre JSON.

- **Endereço base:** `http://localhost:8081` com Docker, `http://localhost:8080` se correres
  à mão. Os exemplos abaixo usam 8081. Como arrancar: [README](../README.md).
- **Consultas** são `GET`. **Recarregar dados** é `POST`.
- Sem autenticação e com CORS aberto: é uma API de desenvolvimento.

## Resumo

| Pedido | Para que serve |
| --- | --- |
| `GET /api/health` | Ver se a API está a funcionar |
| `GET /api/filmes` | Listar filmes, com filtros |
| `GET /api/filme?id=` | Um filme |
| `GET /api/recomendacoes?id=` | Filmes parecidos com um filme |
| `GET /api/recomendacoes_utilizador?user_id=` | Recomendações para um utilizador |
| `POST /api/reload` | Ler outra vez os dois CSV |
| `POST /api/reload/users` | Ler outra vez só `users.csv` |
| `POST /api/reload/movies` | Ler outra vez só `movies.csv` |

---

## Consultar

### `GET /api/health`

```json
{ "status": "ok" }
```

### `GET /api/filmes`

Lista de filmes, por ordem de carregamento. Todos os parâmetros são opcionais.

| Parâmetro | Valores | Por omissão |
| --- | --- | --- |
| `genre` | Nome exato do género, por exemplo `Action` ou `Dark Comedy` | todos |
| `pace` | `slow`, `medium`, `fast`, `unknown` | todos |
| `complexity` | `low`, `medium`, `high`, `unknown` | todos |
| `limit` | 1 a 100 | 20 |
| `offset` | 0 ou mais | 0 |

Os filtros combinam-se (têm de se cumprir todos). Exemplo:

```text
GET /api/filmes?pace=fast&complexity=high&limit=10
```

Resposta (`total` é o número de filmes que cumprem os filtros, antes de aplicar o `limit`):

```json
{
  "total": 100,
  "offset": 0,
  "limit": 10,
  "items": [ { "id": "tt0372784", "title": "Batman Begins", "...": "..." } ]
}
```

### `GET /api/filme?id=tt0372784`

| Parâmetro | Valor |
| --- | --- |
| `id` | **Obrigatório.** O id do filme |

Resposta (resumida):

```json
{
  "id": "tt0372784",
  "title": "Batman Begins",
  "year": 2017,
  "duration": "2h 20m",
  "genre": ["Action", "Action Epic", "Drama", "Epic", "Superhero", "Tragedy"],
  "pace": "fast",
  "complexity": "medium",
  "rating_imdb": "8,2",
  "rating_mpa": "PG-13"
}
```

Um filme tem também realizadores, atores, idiomas, países, prémios, orçamento, e as
classificações inferidas pelo motor (ritmo, complexidade, violência, humor, temas,
tom emocional, público).

- Os campos que podem ter vários valores (`genre`, `director`, `star`, `language`, ...)
  são sempre listas, mesmo que só tenham um.
- Um campo simples que não existe vem a `null`. Uma classificação sem dados suficientes
  vem a `"unknown"`.
- Os valores vêm tal como estão no CSV: por exemplo, `rating_imdb` é o texto `"8,2"`.

### `GET /api/recomendacoes?id=tt0372784`

Filmes parecidos com um filme, do mais parecido para o menos parecido.

| Parâmetro | Valores | Por omissão |
| --- | --- | --- |
| `id` | **Obrigatório.** O id do filme | |
| `min_score` | 0 a 11. Só devolve filmes com pelo menos esta semelhança | 0 |
| `limit` | 1 a 100 | 10 |

```json
{
  "source_id": "tt0372784",
  "total": 99,
  "items": [
    { "score": 6, "movie": { "id": "tt0057242", "title": "Ladybug Ladybug", "...": "..." } }
  ]
}
```

O próprio filme nunca aparece. Em caso de empate na semelhança, ordena pelo id.

### `GET /api/recomendacoes_utilizador?user_id=ana`

Recomendações para um utilizador, com as razões de cada uma.

| Parâmetro | Valores | Por omissão |
| --- | --- | --- |
| `user_id` | **Obrigatório.** O utilizador (coluna `user_id` do `users.csv`) | |
| `limit` | 1 a 100 | 10 |
| `offset` | 0 ou mais | 0 |

Resposta (um item, resumido):

```json
{
  "user_id": "ana",
  "total": 1,
  "offset": 0,
  "limit": 10,
  "items": [
    {
      "score": 93.6,
      "status": "main",
      "movie": { "id": "tt0372784", "title": "Batman Begins", "...": "..." },
      "reasons": [ { "type": "rating", "value": 8.2 }, { "type": "wishlist" } ],
      "satisfied_requirements": [ { "type": "duration", "arguments": [140, 150] } ],
      "unmet_preferences": [ { "type": "genre", "arguments": ["Adventure"] } ],
      "score_breakdown": { "genre": 40, "rating": 24.6, "director": 10, "star": 10, "secondary": 9 }
    }
  ]
}
```

| Campo | O que é |
| --- | --- |
| `score` | Pontuação do filme para este utilizador |
| `status` | `main` cumpre tudo o que foi pedido; `alternative` falha só a nota mínima, dentro da tolerância do utilizador |
| `reasons` | Porque foi recomendado |
| `satisfied_requirements` | Limites do utilizador que o filme cumpre (duração, idioma, idade...) |
| `unmet_preferences` | Preferências que o filme não cumpre |
| `score_breakdown` | Como se chegou ao `score`. Soma dos valores = `score` |

- A ordem é: primeiro os `main`, depois os `alternative`; dentro de cada grupo, maior
  `score` primeiro, depois maior nota, depois o id.
- Uma lista vazia (`"items": []`) quer dizer que nenhum filme é elegível para este
  utilizador (por exemplo, já viu todos os que cumprem os limites).
- Os pesos das regras não se somam no cliente: usa o `score_breakdown`.
- Como a pontuação é calculada: [MOTOR.md](../MOTOR.md).

---

## Recarregar os dados

Depois de alterares um CSV, estes pedidos fazem o Prolog ler-lo outra vez, sem reiniciar.
Não levam corpo.

| Pedido | Lê outra vez |
| --- | --- |
| `POST /api/reload` | `movies.csv` e `users.csv` |
| `POST /api/reload/users` | só `users.csv` |
| `POST /api/reload/movies` | só `movies.csv` |

Resposta:

```json
{ "status": "ok", "reloaded": "users", "movies": 100, "users": 10 }
```

- Demora cerca de 2 segundos, porque o motor volta a correr todas as regras.
  (Isto acontece sempre, porque as conclusões dependem dos dois ficheiros.)
- **Ou muda tudo ou não muda nada.** Os pedidos de consulta que chegarem durante o reload
  veem os dados antigos. Se o CSV tiver um erro, a resposta é `422` e o Prolog continua
  com os dados anteriores.
- Dois reloads ao mesmo tempo correm um a seguir ao outro.

---

## Erros

Os erros têm sempre o mesmo formato, com a mensagem em `error`:

```json
{ "error": "Filme não encontrado" }
```

| Código | Quando |
| --- | --- |
| `400` | Parâmetro em falta ou inválido (por exemplo `limit=0`, `pace=xpto`) |
| `404` | Filme ou utilizador que não existe |
| `405` | Método errado (por exemplo `GET /api/reload`) |
| `422` | Um reload encontrou um CSV inválido |
| `500` | Erro inesperado no Prolog (fica registado nos logs) |

---

## Para quem altera a API

### Organização do código

| Ficheiro | Responsabilidade |
| --- | --- |
| `server.pl` | Ponto de entrada: carrega o motor, regista os controllers, `start/0,1` e `stop/0` |
| `http_common.pl` | CORS, método HTTP, erros JSON, paginação e logs |
| `health_controller.pl` | `/api/health` |
| `movies_controller.pl` | `/api/filmes`, `/api/filme`, `/api/recomendacoes` (e a serialização de um filme) |
| `users_controller.pl` | `/api/recomendacoes_utilizador` |
| `reload_controller.pl` | `/api/reload`, `/api/reload/users`, `/api/reload/movies` |

Um novo controller é um módulo com os seus `http_handler`, no formato
`api_handle(get, handler)`, carregado em `server.pl`. A lógica de recarga
(`recarrega_base/1`) está em `../filmes_bc.pl`, junto do carregamento dos factos.

### Logs

Cada pedido escreve uma linha (`docker compose logs -f swi-prolog`):

```text
GET /api/filme?id=x -> 404 (1 ms)
POST /api/reload -> 200 (1672 ms)
```

### Testes

Dentro de `swi-prolog/`:

```bash
python api/test_http.py
```

Arranca um servidor temporário, faz pedidos HTTP reais (consultas, filtros, erros,
CORS e reloads) e termina-o.

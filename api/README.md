# API de filmes

Requer SWI-Prolog com as bibliotecas HTTP (incluídas na instalação padrão).
Iniciar a partir da raiz do projeto:

```bash
swipl -q -s api/consulta.pl -g 'consulta:start(8080), thread_get_message(stop)'
```

O arranque calcula as inferências antes de aceitar pedidos. Terminar com Ctrl+C.
Na consola Prolog, também é possível usar `consulta:start(8080).` e `consulta:stop.`.
O CSV é localizado relativamente ao carregador, independentemente da pasta atual.

## Contrato HTTP

Todos os endpoints usam GET e devolvem JSON. CORS permite qualquer origem,
sem credenciais, para desenvolvimento. OPTIONS é suportado.

| Endpoint | Parâmetros | Resposta |
| --- | --- | --- |
| `/api/health` | — | `{ "status": "ok" }` |
| `/api/filmes` | `genre`, `pace`, `complexity`, `limit` (20), `offset` (0) | `{ total, offset, limit, items: [...] }` |
| `/api/filme` | `id` obrigatório | Objeto do filme |
| `/api/recomendacoes` | `id` obrigatório, `min_score` (0), `limit` (10) | `{ source_id, total, items: [{ score, movie }] }` |

`limit` aceita 1–100; `offset` aceita inteiros não negativos. Os filtros combinam-se
por AND. `pace`: slow/medium/fast/unknown; `complexity`: low/medium/high/unknown.
`genre` usa o nome exato do CSV, por exemplo `Action` ou `Dark Comedy`.
As recomendações excluem o próprio filme e ordenam por pontuação decrescente,
com desempate por ID. `min_score` aceita 0–11. `total` conta os resultados antes
de aplicar o limite. Os filmes são listados pela ordem de carregamento.

Cada filme tem `id`, `title`, os atributos do CSV e classificações inferidas.
Atributos multivalorados (`genre`, `director`, `language`, `themes`, etc.) são
listas, mesmo quando só existe um valor. Um atributo escalar ausente é `null`;
classificações sem indícios usam `"unknown"`. Os valores do CSV mantêm o tipo
carregado pelo Prolog: por exemplo `rating_imdb` pode ser a string `"8,2"`.

Erros dos endpoints devolvem `{ "error": "mensagem" }`: 400 para parâmetros
inválidos/ausentes, 404 para filme inexistente e 405 para métodos não suportados.
Não é aceite código Prolog vindo do cliente. A API disponibiliza apenas leitura;
reiniciar o processo após alterar o CSV ou as regras.

## Exemplo de frontend

```javascript
const params = new URLSearchParams({ pace: 'fast', complexity: 'high', limit: '10' });
const response = await fetch(`http://localhost:8080/api/filmes?${params}`);
const data = await response.json();
if (!response.ok) throw new Error(data.error);
console.log(data.items);

const recommendations = await fetch(
  'http://localhost:8080/api/recomendacoes?id=tt0372784&min_score=7'
).then(response => response.json());
console.log(recommendations.items);
```

## Testes

```bash
python3 api/test_http.py
```

O teste inicia um servidor temporário, verifica pedidos HTTP reais e termina-o.

## Inquéritos e recomendações por utilizador

A pipeline carrega `knowledge_base_users.csv` através de `user_bc.pl` e aplica
`rules_user.pl` aos perfis e aos factos dos filmes. Não gera código Prolog a partir
do texto recebido: os dados são factos `user_fact/1` em memória. O ficheiro incluído
contém apenas o cabeçalho, sem utilizadores reais ou perfis de exemplo ativos.

Formato obrigatório (uma linha por utilizador, listas separadas por `|`):

```csv
user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages
demo,25,tt0054215,tt0372784,Action|SciFi,Romance,English,
```

Usar IDs de filmes do catálogo e nomes de género/idioma do CSV dos filmes.
`Sci-Fi` é normalizado para `SciFi`. Campos de listas podem ficar vazios.
`user_id` deve ser único e não vazio; `age` é um inteiro entre 0 e 120.
Referências a filmes fora do catálogo não produzem recomendações por similaridade.
O carregamento valida o ficheiro antes de substituir os perfis em memória.

É possível selecionar outro ficheiro no arranque:

```bash
USERS_CSV=/caminho/inqueritos.csv swipl -q -s api/consulta.pl -g 'consulta:start(8080), thread_get_message(stop)'
```

Novo endpoint:

```text
GET /api/recomendacoes_utilizador?user_id=demo&limit=10&offset=0
```

Resposta: `{ user_id, total, offset, limit, items: [{ score, reasons, movie }] }`.
Um utilizador inexistente devolve 404. Um perfil sem correspondências devolve
uma lista vazia. A ordenação é por score decrescente e ID como desempate.
`reasons` contém objetos como `{ "type": "genre", "value": "Action" }`,
`{ "type": "wishlist" }` e `{ "type": "watched_similarity", "movie_id": "..." }`.

Pontuação inicial, ajustável em `rules_user.pl`:

- +4 por género preferido correspondente;
- +2 por idioma preferido correspondente;
- +6 se o filme está na lista “quero ver”;
- +1 no máximo por semelhança >= 7 com filmes vistos (familiaridade, não gosto).

Filmes vistos ou com géneros/idiomas rejeitados são excluídos, mesmo que estejam
na lista “quero ver”. A idade aplica uma política conservadora baseada em MPA:
G/PG permitidos; PG-13 a partir dos 13; R/NC-17 a partir dos 18. Classificação
ausente/desconhecida exclui o filme para menores. Esta política da aplicação
não substitui uma classificação etária oficial nem considera acompanhamento adulto.

Na consola Prolog, depois de carregar `filmes_bc` e executar `arranca_motor`:

```prolog
user_fact(user(Id)).
user_recommendation(demo, Movie, Score, Reasons).
```

Reiniciar a API após atualizar o CSV. Os perfis não são expostos por um endpoint
público de listagem; a API atual continua a ser de desenvolvimento, sem autenticação.
Antes de disponibilizar dados reais fora do ambiente local, associar `user_id`
à sessão autenticada no frontend/backend.

Testes dos perfis: `swipl -q -s tests_users.pl -g run_tests -t halt`.
O teste HTTP também verifica o novo endpoint com um CSV temporário.

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
`rules_users.pl` aos perfis e aos factos dos filmes. Não gera código Prolog a partir
do texto recebido: os dados são factos `user_fact/1` em memória. O ficheiro incluído
contém 10 utilizadores fictícios com preferências variadas para experimentar as
recomendações: ana, bruno, carla, diogo, eva, filipe, ines, joao, mariana e tiago.

Formato base, ainda aceite (uma linha por utilizador, listas separadas por `|`):

```csv
user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages
demo,25,tt0054215,tt0372784,Action|SciFi,Romance,English,
```

Usar IDs de filmes do catálogo e nomes de género/idioma do CSV dos filmes.
`Sci-Fi` é normalizado para `SciFi`. Campos de listas podem ficar vazios.
`user_id` deve ser único e não vazio; `age` pode ficar vazio ou conter um inteiro entre 0 e 120.
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

Resposta: `{ user_id, total, offset, limit, items: [{ score, reasons, movie,
status, satisfied_requirements, unmet_preferences, score_breakdown }] }`.
Um utilizador inexistente devolve 404. Sem preferências pontuáveis, os filmes
elegíveis continuam disponíveis, ordenados pela avaliação. Uma lista vazia
significa que não há filmes elegíveis. Opções `main` aparecem antes de
`alternative`; dentro de cada grupo, pontuação decrescente, avaliação decrescente
e ID. `reasons` mantém os motivos positivos e acrescenta `rating`.

A pontuação usa grupos limitados: género 40 pontos (uma vez), avaliação IMDb
`3 × nota` (0–30), realizador 10, ator 10 e restantes motivos somados até 9.
A lista de desejos contribui 6 para esse último grupo; cada idioma, 2; semelhança com filmes explicitamente apreciados,
1 no máximo. Esta configuração dá maior peso aos critérios principais, sem
multiplicar pontos por cada ator ou género. Não constitui uma ordenação
lexicográfica entre critérios nem uma probabilidade. `score_breakdown` mostra
as contribuições efetivas de cada grupo, cuja soma dá `score`.

Filmes vistos são excluídos salvo se `allow_rewatch=true`. Filmes com géneros
ou idiomas rejeitados são sempre excluídos, mesmo que estejam na lista “quero ver”. A idade mínima da sessão (ou a idade do perfil, se não definida) aplica uma política conservadora baseada em MPA:
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

### Novas preferências opcionais

O cabeçalho de `knowledge_base_users.csv` inclui agora as colunas abaixo, depois
das oito originais. Podem ficar vazias ou conter vários valores separados por `|`.
Também são aceites ficheiros com apenas as oito colunas originais ou com um
subconjunto das novas colunas. Valores enumerados inválidos rejeitam o carregamento.

| Coluna | Valores | Pontos por correspondência |
| --- | --- | --- |
| `preferred_directors` | Nomes de `director`, ex.: `Christopher Nolan` | 10 |
| `preferred_writers` | Nomes de `writer` | 2 |
| `preferred_stars` | Nomes de `star`, ex.: `Christian Bale` | 10 |
| `preferred_countries` | Nomes de `country_origin`, ex.: `United States` | 1 |
| `preferred_subgenres` | Subgéneros reconhecidos em `rules_movies.pl`, ex.: `Superhero` | 3 |
| `preferred_pace` | `slow`, `medium`, `fast` | 2 |
| `preferred_complexity` | `low`, `medium`, `high` | 2 |
| `preferred_violence` | `low`, `medium`, `high` | 2 |
| `preferred_humor` | `low`, `medium`, `high` | 2 |
| `preferred_psychological_intensity` | `low`, `medium`, `high` | 2 |
| `preferred_emotional_tones` | `tense`, `dark`, `sad`, `lighthearted`, `romantic`, `reflective`, `exciting` | 2 |
| `preferred_themes` | `love`, `family`, `growing_up`, `crime`, `justice`, `war`, `history`, `technology`, `supernatural`, `exploration`, `psychology`, `music`, `sport`, `life_story` | 3 |
| `preferred_audience` | `mainstream`, `niche` | 1 |
| `preferred_eras` | `classic` (antes de 2000), `modern` (2000–2019), `recent` (desde 2020) | 1 |
| `preferred_popularity` | `very_popular` (>= 1 milhão de votos), `popular` (500 mil–999 999), `less_popular` (< 500 mil) | 1 |

São preferências que somam pontos, não limites obrigatórios: `preferred_violence=low`
favorece baixa violência, mas não exclui outros níveis. As exclusões existentes
continuam a prevalecer. Valores repetidos não somam pontos extra. Atributos
inferidos exigem executar `arranca_motor` e seguem as heurísticas de
`rules_movies.pl`; ausência de informação (`unknown`) não corresponde a uma preferência.
Época e popularidade usam os anos e votos do catálogo, sem corrigir os dados originais.

Exemplo de ficheiro com um subconjunto de colunas adicionais:

```csv
user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages,preferred_directors,preferred_pace,preferred_themes,preferred_eras
demo,25,,,Action,,English,,Christopher Nolan,fast,justice|exploration,modern
```

Os pesos da tabela estão sujeitos aos limites por grupo descritos acima.

O carregador cria, por exemplo, `user_fact(prefers(demo,pace,fast))`.
`rules_users.pl` cruza esse facto com `facto(_,pace(Movie,fast))`, soma 2 pontos
e inclui `pace(fast)` na explicação. Na API corresponde a
`{"type":"pace","value":"fast"}`. Não são executadas regras escritas no CSV.

### Regras de produção dos utilizadores

`rules_users.pl` contém as regras 34–65 no formato `regra N se [...] entao
[cria_facto(...)].`, partilhando o motor com as regras 1–33 dos filmes.
`rules_user.pl` mantém-se como ficheiro de compatibilidade.
O carregamento copia também os dados de `user_fact/1` para factos numerados
`facto/2`, permitindo justificar as conclusões com os dados do inquérito.

As regras inferem `preference_reason(User,Movie,Reason,Weight)`,
`excluded_movie(User,Movie)` e `matches_preferences(User,Movie)`.
Uma correspondência de preferências pode existir para um filme excluído;
`user_recommendation/4` aplica as exclusões e soma a pontuação só na consulta,
após terminar o motor, evitando guardar resultados parciais.

Depois de alterar o CSV, recarregar os factos e voltar a executar o motor
(`load_users` isoladamente apenas atualiza `user_fact/1`):

```prolog
carrega_factos_filmes.
arranca_motor.
user_recommendation(demo, Movie, Score, Reasons).
facto(N, preference_reason(demo, Movie, pace(fast), 2)).
% No sp_exp2, usar o N obtido acima:
como(N).
```

As características de violência, ritmo e restantes atributos continuam a
classificar filmes; as novas conclusões relacionam cada utilizador com um filme.

### Limites obrigatórios e público da sessão

Colunas opcionais do CSV (preenchidas nos 10 perfis fictícios incluídos, com
limites e rejeições compatíveis com as respetivas listas de desejos):

| Coluna | Formato e significado |
| --- | --- |
| `max_duration_minutes` | Inteiro 1–1440; duração máxima inclusiva |
| `year_from`, `year_to` | Inteiros 1800–3000; intervalo inclusivo; aceita só um extremo |
| `required_languages` | Idiomas separados por `|`; basta existir um dos indicados |
| `disliked_directors`, `disliked_stars` | Nomes exatos do catálogo separados por `|`; qualquer correspondência exclui |
| `session_min_age` | Inteiro 0–120; idade do espectador mais novo, substitui a idade do perfil para esta sessão |
| `min_rating` | Número 0–10; avaliação IMDb pretendida |
| `rating_tolerance` | Número 0–10; margem abaixo do mínimo; por defeito 0 |
| `rating_required` | `true` ou `false`; `true` impede qualquer tolerância; por defeito `false` |

Campos vazios não impõem limites. Sem idade no perfil e sem idade da sessão,
não é possível verificar a adequação etária; não se assume um público adulto.
Não há descritores de linguagem imprópria no catálogo: idiomas e classificação
MPA não comprovam a ausência de palavrões. A informação de idiomas refere-se ao
catálogo, sem garantir versões dobradas ou legendadas.

`min_rating=8`, `rating_tolerance=0.5`, `rating_required=false`: notas >=8 são
principais, notas de 7.5 inclusive até 8 exclusive são alternativas, abaixo de
7.5 são excluídas. Com `rating_required=true`, todas as notas abaixo de 8 são
excluídas. Tolerância nunca relaxa duração, período, idiomas, rejeições ou idade.
Definir tolerância ou obrigatoriedade sem mínimo é um erro de validação.
Intervalos de anos invertidos também são rejeitados antes de substituir os perfis.

Quando falta informação para verificar um limite explícito, o filme é excluído.
Durações como `2h 30m`, `2h` e `90m` e avaliações com vírgula são normalizadas
para cálculo, preservando os valores originais apresentados no objeto do filme.
A avaliação IMDb ainda é absoluta: não existe calibração por género nem foi
inventado um ajuste estatístico a partir desta amostra.

Exemplo de perfil para uma sessão com crianças:

```csv
user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages,max_duration_minutes,year_from,year_to,required_languages,session_min_age,min_rating,rating_tolerance,rating_required
familia,35,,,Animation|Family,Horror,English,,100,2000,2026,English|Portuguese,8,7,0.5,false
```

As regras 62–65 acrescentam rejeições de pessoas, incumprimento dos limites e
exclusão final. `user_constraints.pl` contém normalização, verificações e cálculo.
`facto(_,exclusion_reason(User,Movie,Reason))` permite consultar a causa de exclusão.
`recommendation_explanation(User,Movie,Status,Checks,Unmet)` explica filmes elegíveis.
Na API, requisitos e preferências não satisfeitas têm formato
`{"type":"rating_below_target","arguments":[7.5,8]}` ou
`{"type":"duration","arguments":[95,100]}`. Os motivos positivos mantêm o formato
anterior. Os pesos isolados das regras não devem ser somados pelo cliente:
usar `score_breakdown`, que já aplica os limites dos grupos.

Testar: `swipl -q -s tests_user_constraints.pl -g run_tests -t halt`.

### Histórico com avaliação pessoal e pedidos para rever

`watched` guarda pares `filme=nota` separados por `|`, sem parênteses retos:

```text
tt0087469=4|tt7798634=1
```

Notas inteiras entre 0 e 5: 0 significa visto mas não classificado; 1–2 indicam
avaliações negativas; 3 é intermédio; 4–5 indicam filmes apreciados.
O limiar 4 é uma política ajustável na regra 41. Notas 0–3 não geram bónus por
semelhança nem exclusões de outros filmes. Não há médias de avaliações pessoais.
IDs antigos sem `=nota` são aceites como nota 0. Entradas malformadas, notas fora
do intervalo e filmes duplicados no histórico são rejeitados antes de substituir
os perfis em memória.

O carregador cria dois factos por entrada:

```prolog
% Exemplos de factos carregados:
user_fact(watched(ana, tt0087469)).
user_fact(user_movie_rating(ana, tt0087469, 4)).
% Consultar todo o histórico e respetivas notas:
user_fact(user_movie_rating(ana, Movie, Rating)).
```

A regra 41 cruza avaliações >=4 com similaridade >=7 e produz
`liked_similarity(Reference)`. A contribuição total mantém-se em 1 ponto no
máximo, mesmo com várias referências apreciadas. Na API, o motivo continua a
usar `type: liked_similarity` e `movie_id`. Esta avaliação pessoal (0–5) é
independente da nota IMDb (0–10).

`allow_rewatch=true` permite recomendar filmes vistos, qualquer que seja a nota;
vazio ou `false` mantém a exclusão. Os outros requisitos continuam obrigatórios.
Não existe uma coluna separada para filmes apreciados.

Os exemplos fornecidos para Ana e Carla foram aplicados, preservando o histórico
anterior da Carla. Os restantes filmes vistos migraram para nota 0, pois não
havia avaliações pessoais registadas. Uma nota positiva num filme de terror não
anula uma rejeição de terror para a sessão atual.
Após editar o CSV, executar `carrega_factos_filmes.` e `arranca_motor.`.

### Estado da lista de requisitos da entrevista

| Elemento | Estado |
| --- | --- |
| Duração, anos e idioma obrigatórios | Implementado |
| Rejeição de realizadores e atores | Implementado |
| Público da sessão | Implementado por idade mínima; sem descritores de conteúdo |
| Classificação mínima, tolerância e plano B | Implementado |
| Filmes apreciados e pedidos para rever | Implementado; depende do preenchimento dos gostos |
| Conteúdo e linguagem imprópria | Pendente de descritores fiáveis por filme |
| Plataformas acessíveis | Pendente de disponibilidade por plataforma, região e data |
| Sagas | Pendente de identificação das sagas no catálogo |
| Avaliações de pessoas semelhantes | Pendente de avaliações explícitas e de uma medida validada de semelhança entre utilizadores |

Os dados ausentes não são deduzidos dos títulos, dos géneros nem das produtoras.

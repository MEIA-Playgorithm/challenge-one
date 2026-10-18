# Prolog vs Drools: o que muda e porquê

Os dois motores fazem o mesmo trabalho (mesmas exclusões, mesmos 19 tipos de motivo de preferência, mesma pontuação e
mesmo estado `main` / `alternative`) e têm os mesmos endpoints, parâmetros, paginação e erros 400 e 404. A tabela tem
só o que muda. O frontend é quem dita o contrato, por isso a última coluna diz se o front já é afetado.

Medido com os mesmos pedidos aos dois motores a correr (100 filmes, 10 utilizadores) e com a leitura das regras e do
código do front.

| O que muda | Endpoint | Prolog | Drools | Porquê | Front |
| --- | --- | --- | --- | --- | --- |
| Utilizador sem preferências (ou com poucas) | `GET /api/recomendacoes_utilizador` | 100 recomendações | 0 (só filmes com algum motivo de preferência) | A regra do Drools exige pelo menos um motivo de preferência | Afeta já: todo o utilizador novo |
| Reload com CSV inválido | `POST /api/reload/users` | `422` com a mensagem; a base anterior mantém-se | `200`, aceita o CSV | O Drools não valida o CSV | Afeta já: o front mostra o erro do reload |
| `rating_imdb` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | texto `"8,2"` ou inteiro `7` | número `8.2` | O Prolog devolve o que está no CSV; o Drools converte | Afeta já: o front declara `string` |
| Títulos com acento (2 filmes) | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | estragados (`Ãducation`) | corretos | O Prolog lê o fluxo HTTP como `octet` (Latin-1) e ignora o `charset=utf-8` que a knowledge base envia | Afeta já: aparecem na lista |
| Ordem dos empates no `score` | `GET /api/recomendacoes_utilizador` | por nota e id | sem critério (varia entre pedidos) | O Drools não define desempate | Afeta já: ordem da lista |
| Pontuação de `Smash Palace` (carla) | `GET /api/recomendacoes_utilizador` | 30 | 28 | Grupo `secondary` 9 contra 7; causa por investigar | Afeta já: `score` |
| `reasons` | `GET /api/recomendacoes_utilizador` | valor concreto (`genre: "Action"`) e `rating` | `"preferred"`, sem `rating` | O Drools não guarda o valor da razão | Vai precisar |
| `satisfied_requirements` | `GET /api/recomendacoes_utilizador` | preenchido | sempre `[]` | Não implementado no Drools | Vai precisar |
| `unmet_preferences` | `GET /api/recomendacoes_utilizador` | preenchido | sempre `[]` | Não implementado no Drools | Vai precisar |
| Explicação de como se chegou a uma recomendação | `GET /api/how` | só na consola | na API | Só o Drools a expõe por HTTP | Vai precisar |
| Explicação de porque um filme não foi recomendado | `GET /api/why-not` | só na consola | na API | Só o Drools a expõe por HTTP | Vai precisar |
| Eventos de regras disparadas | `GET /api/trace` | — | na API | Só o Drools os tem | Vai precisar |
| `duration` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | `"2h 20m"` | `140` | Formatos diferentes | Não usa |
| `vote`, `budget`, `win`, `nomination`, `oscar` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | valor do CSV | sempre `null` | O Drools não lê estas colunas | Não usa |
| `filming_location`, `production_company` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | lista do CSV | lista vazia na maioria dos filmes | O Drools não lê estas colunas | Não usa |
| `rating_mpa` sem valor | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | `""` | `null` | Formatos diferentes | Não usa |
| Ordem de `country_origin`, `director`, `emotional_tone`, `genre`, `language`, `star`, `themes` | `GET /api/filmes`<br>`GET /api/filme`<br>`GET /api/recomendacoes`<br>`GET /api/recomendacoes_utilizador` | uma | outra, com os mesmos elementos | Cada motor ordena à sua maneira | Não usa |
| Filtro `genre=Sword Sandal` | `GET /api/filmes?genre=` | 1 filme | 0 | O Prolog normaliza espaços; o CSV tem dois | Não usa |
| Rota inexistente | `GET /api/nao_existe` | `404` com `{"code": 404, "location": ..., "message": "Path not found: ..."}` | `404` com `{"error": "Route not found"}` | O Prolog usa o formato de erro do SWI-Prolog para rotas inexistentes | Não usa |
| Método errado (`405`) | `GET /api/reload`<br>`POST /api/health` | com CORS | sem CORS | | Não usa |
| `OPTIONS` sem `Access-Control-Request-Method` | `OPTIONS /api/filmes` | `200` | `403` | O pré-voo real de um browser dá `200` nos dois | Não usa |
| Documentação da API | `GET /docs`<br>`GET /openapi.json`<br>`GET /swagger-ui/index.html` | — | sim | Só o Drools gera OpenAPI | Não usa |
| Diálogo «porquê?» | — (só consola) | sim | — | Só existe no Prolog | Não usa (sem API) |
| Regras de género, realizador e ator obrigatórios | — (só consola) | — | sim | Só existem no Drools | Não usa (sem API) |

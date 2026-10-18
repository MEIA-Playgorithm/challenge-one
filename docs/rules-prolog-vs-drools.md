# Regras: SWI-Prolog vs. Drools

Resumo das regras dos dois motores, ordenadas pela numeração do Prolog (r1 a r69).

- **Prolog:** `swi-prolog/rules_movies.pl` (r1–r33) e `swi-prolog/rules_users.pl` (r34–r69).
- **Drools:** `drools/src/main/resources/meia/playgorithm/rules.drl` (regras de utilizador). O conhecimento derivado dos filmes calcula-se em Java (`SampleMovieCatalog`, `Movie`).
- **Base de conhecimento:** os dois motores leem `movies.csv` e `users.csv` do serviço `knowledge_base`. O Prolog lê no arranque e em `POST /api/reload`; o Drools lê a cada pedido.

Legenda: `x` = implementada e usada no cálculo · `~` = implementada com comportamento diferente · vazio = não existe.

## 1. Conhecimento derivado dos filmes (r1–r33)

| Regra | Descrição | Prolog | Drools |
|---|---|:-:|:-:|
| r1 | Ritmo (`pace`) a partir dos géneros | x | x |
| r2 | Complexidade a partir dos géneros | x | x |
| r3 | Violência a partir dos géneros | x | x |
| r4 | Humor a partir dos géneros | x | x |
| r5 | Intensidade psicológica a partir dos géneros | x | x |
| r6 | Tom emocional a partir dos géneros | x | x |
| r7 | Temas a partir dos géneros | x | x |
| r8 | Público (`mainstream` ou `niche`) a partir dos votos | x | x |
| r9 | Facto `mainstream` | x | |
| r10 | Facto `niche` | x | |
| r11 | Subgénero (género conhecido como subgénero) | x | x |
| r12 | Filme recente (≥ 2020) | x | x |
| r13 | Filme clássico (< 2000) | x | x |
| r14 | Filme moderno (2000–2019) | x | x |
| r15 | Anos 90 | x | |
| r16 | Anos 2000 | x | |
| r17 | Anos 2010 | x | |
| r18 | Anos 2020 | x | |
| r19 | Muito popular (≥ 1M votos) | x | x |
| r20 | Popular (500k–1M votos) | x | x |
| r21 | Menos popular (< 500k votos) | x | x |
| r22 | Lista de géneros ordenada (`get_genre`) | x | |
| r23 | Filme com vários géneros | x | |
| r24 | Mesmo género entre dois filmes | x | |
| r25 | Mesmo realizador | x | |
| r26 | Mesmo argumentista | x | |
| r27 | Mesmo ator | x | |
| r28 | Mesma produtora | x | |
| r29 | Mesma língua | x | |
| r30 | Mesmo país | x | |
| r31 | Mesmo ano | x | |
| r32 | Filme semelhante (mesmo género e língua) | x | |
| r33 | Pontuação de semelhança (género 4, realizador 3, argumentista 2, país 1, língua 1) | x | x |

Notas:
- Nenhuma regra usa r9, r10 e r15–r18. As r22–r32 só alimentam a consulta interativa no Prolog.
- O Drools calcula a r33 diretamente em Java, sem passar por r24–r32.

## 2. Exclusões (r34–r37, r62–r69)

| Regra | Descrição | Prolog | Drools |
|---|---|:-:|:-:|
| r34 | Já visto (salvo `allow_rewatch`) | x | x |
| r35 | Género não desejado | x | x |
| r36 | Língua não desejada | x | x |
| r37 | Idade / classificação MPA (`session_min_age`) | x | x |
| r62 | Realizador não desejado | x | x |
| r63 | Ator não desejado | x | x |
| r64 | Duração máxima | x | x |
| r65 | Facto `excluded_movie` | x | ~ |
| r66 | Ano mínimo | x | x |
| r67 | Ano máximo | x | x |
| r68 | Línguas obrigatórias | x | x |
| r69 | Avaliação mínima e tolerância | x | x |

Notas:
- **r65:** no Drools é uma flag no filme, não uma regra.
- **r69:** o Drools divide-a em duas regras, uma para avaliação estrita e outra com tolerância.
- **Só no Drools:** género, realizador e ator obrigatórios. O CSV não tem essas colunas, por isso nunca disparam.

## 3. Preferências positivas (r38–r61)

| Regra | Descrição (pontos) | Prolog | Drools |
|---|---|:-:|:-:|
| r38 | Género (40) | x | x |
| r39 | Língua (2) | x | ~ |
| r40 | Wishlist (6) | x | x |
| r41 | Semelhante a filme visto com nota ≥ 4 (1) | x | |
| r42 | Realizador (10) | x | x |
| r43 | Argumentista (2) | x | ~ |
| r44 | Ator (10) | x | x |
| r45 | País (1) | x | ~ |
| r46 | Subgénero (3) | x | ~ |
| r47 | Ritmo (2) | x | x |
| r48 | Complexidade (2) | x | x |
| r49 | Violência (2) | x | x |
| r50 | Humor (2) | x | x |
| r51 | Intensidade psicológica (2) | x | x |
| r52 | Tom emocional (2) | x | ~ |
| r53 | Temas (3) | x | ~ |
| r54 | Público (1) | x | x |
| r55 | Época clássica (1) | x | x |
| r56 | Época moderna (1) | x | x |
| r57 | Época recente (1) | x | x |
| r58 | Popularidade: muito popular (1) | x | x |
| r59 | Popularidade: popular (1) | x | x |
| r60 | Popularidade: menos popular (1) | x | x |
| r61 | `matches_preferences` | x | |

Notas:
- **`~` em r39, r43, r45, r46, r52, r53:** o Prolog soma por cada valor que coincide. O Drools conta uma vez por categoria. É a causa de 30 vs. 28 pontos no filme `tt0083096` da `carla`.
- **r41:** a regra existe no Drools mas nunca dispara. Nada preenche `Movie.similarTo` (`addSimilarTo()` não é chamado) e, mesmo que preenchesse, não filtraria por nota ≥ 4.
- **r55–r60:** o Drools junta as 3 de época numa regra e as 3 de popularidade noutra.
- **r61:** o Prolog não a usa para filtrar. O Drools exige pelo menos uma razão positiva para criar a recomendação.

## 4. Cálculo na consulta (fora da numeração)

| Item | Prolog | Drools |
|---|:-:|:-:|
| Pontuação (género 40, IMDb 3×nota, realizador 10, ator 10, restantes com teto 9) | x | x |
| `status`: principal ou alternativo | x | x |
| Ordenação (principais primeiro, depois pontuação e nota) | x | ~ |
| `satisfied_requirements` | x | |
| `unmet_preferences` | x | ~ |

Notas:
- **Ordenação:** o Drools não desempata por nota nem por id. Com pontuações iguais a ordem difere (ex.: `joao`).
- **`satisfied_requirements`:** no Drools é sempre `[]`.
- **`unmet_preferences`:** o Drools preenche menos itens (46 contra 52 nos 10 utilizadores atuais).

## 5. Totais

| | Nº de regras |
|---|:-:|
| Prolog (r1–r69) | 69 |
| Drools equivalentes (`x`) | 43 |
| Drools com comportamento diferente (`~`) | 7 (r39, r43, r45, r46, r52, r53, r65) |
| Sem equivalente no Drools | 19 |

Dos 19 sem equivalente, 17 são factos auxiliares sem efeito no resultado (r9, r10, r15–r18, r22–r32). As duas que importam são **r41** e **r61**.

## 6. Verificação feita

Com a stack a correr (Prolog em 8081, Drools em 8082):
- **Status HTTP e erros:** iguais nos endpoints comuns.
- **Filmes:** 100 filmes comparados; os campos derivados coincidem, exceto `rating_mpa` (`""` vs. `null`, 19 filmes) e um género com dois espaços (`tt0274932`).
- **Semelhança (`/api/recomendacoes`):** idêntica nos 100 filmes.
- **Recomendações por utilizador:** idênticas (filmes, pontuação, `status`, ordem) em 8 dos 10 utilizadores. `carla` difere numa pontuação (r39) e `joao` na ordem dos empates.

## 7. Correções propostas

1. **r41 no Drools:** preencher a semelhança a partir dos filmes vistos com nota ≥ 4 e semelhança ≥ 7.
2. **Soma por valor:** nas r39, r43, r45, r46, r52 e r53, somar por cada valor que coincide, como o Prolog.
3. **Desempate:** ordenar por `(estado, -pontuação, -nota, id)`, como o Prolog.
4. **Opcional:** preencher `satisfied_requirements` e `reasons[].value` no Drools; decidir se a r61 passa a filtrar também no Prolog.

# Rules: Prolog vs Drools

A summary of the rules of both engines, ordered by the Prolog numbering (r1 to r69).

- **Prolog:** `swi-prolog/rules_movies.pl` (r1–r33) and `swi-prolog/rules_users.pl` (r34–r69).
- **Drools:** `drools/src/main/resources/meia/playgorithm/engine/rules.drl` (the user rules). The knowledge
  derived about the movies is calculated in Java (`MovieCatalog` and `Movie`).
- **Knowledge base:** both engines read `movies.csv` and `users.csv` from the `knowledge_base` service. Both
  read them at startup and on `POST /api/reload`.

Key: `x` = implemented and used in the calculation · `~` = implemented with different behaviour · empty =
does not exist.

## 1. Knowledge derived from the movies (r1–r33)

| Rule | Description | Prolog | Drools |
|---|---|:-:|:-:|
| r1 | Pace (`pace`) from the genres | x | x |
| r2 | Complexity from the genres | x | x |
| r3 | Violence from the genres | x | x |
| r4 | Humour from the genres | x | x |
| r5 | Psychological intensity from the genres | x | x |
| r6 | Emotional tone from the genres | x | x |
| r7 | Themes from the genres | x | x |
| r8 | Audience (`mainstream` or `niche`) from the votes | x | x |
| r9 | `mainstream` fact | x | |
| r10 | `niche` fact | x | |
| r11 | Subgenre (a genre known as a subgenre) | x | x |
| r12 | Recent movie (2020 or later) | x | x |
| r13 | Classic movie (before 2000) | x | x |
| r14 | Modern movie (2000–2019) | x | x |
| r15 | The 1990s | x | |
| r16 | The 2000s | x | |
| r17 | The 2010s | x | |
| r18 | The 2020s | x | |
| r19 | Very popular (1M votes or more) | x | x |
| r20 | Popular (500k–1M votes) | x | x |
| r21 | Less popular (under 500k votes) | x | x |
| r22 | Sorted genre list (`get_genre`) | x | |
| r23 | Movie with several genres | x | |
| r24 | Same genre in two movies | x | |
| r25 | Same director | x | |
| r26 | Same writer | x | |
| r27 | Same actor | x | |
| r28 | Same production company | x | |
| r29 | Same language | x | |
| r30 | Same country | x | |
| r31 | Same year | x | |
| r32 | Similar movie (same genre and language) | x | |
| r33 | Similarity score (genre 4, director 3, writer 2, country 1, language 1) | x | x |

Notes:
- No rule uses r9, r10 or r15–r18. Rules r22–r32 only feed the interactive query in Prolog.
- Drools calculates r33 directly in Java, without going through r24–r32.

## 2. Exclusions (r34–r37, r62–r69)

| Rule | Description | Prolog | Drools |
|---|---|:-:|:-:|
| r34 | Already watched (unless `allow_rewatch`) | x | x |
| r35 | Disliked genre | x | x |
| r36 | Disliked language | x | x |
| r37 | Age / MPA rating (`session_min_age`) | x | x |
| r62 | Disliked director | x | x |
| r63 | Disliked actor | x | x |
| r64 | Maximum duration | x | x |
| r65 | `excluded_movie` fact | x | ~ |
| r66 | Minimum year | x | x |
| r67 | Maximum year | x | x |
| r68 | Required languages | x | x |
| r69 | Minimum rating and tolerance | x | x |

Notes:
- **r65:** in Drools it is a flag on the movie, not a rule.
- **r69:** Drools splits it into two rules, one for a strict rating and one with tolerance.
- **Drools only:** mandatory genre, director and actor. The CSV has no such columns, so they never fire.

## 3. Positive preferences (r38–r61)

| Rule | Description (points) | Prolog | Drools |
|---|---|:-:|:-:|
| r38 | Genre (40) | x | x |
| r39 | Language (2) | x | ~ |
| r40 | Wishlist (6) | x | x |
| r41 | Similar to a watched movie rated 4 or more (1) | x | |
| r42 | Director (10) | x | x |
| r43 | Writer (2) | x | ~ |
| r44 | Actor (10) | x | x |
| r45 | Country (1) | x | ~ |
| r46 | Subgenre (3) | x | ~ |
| r47 | Pace (2) | x | x |
| r48 | Complexity (2) | x | x |
| r49 | Violence (2) | x | x |
| r50 | Humour (2) | x | x |
| r51 | Psychological intensity (2) | x | x |
| r52 | Emotional tone (2) | x | ~ |
| r53 | Themes (3) | x | ~ |
| r54 | Audience (1) | x | x |
| r55 | Classic era (1) | x | x |
| r56 | Modern era (1) | x | x |
| r57 | Recent era (1) | x | x |
| r58 | Popularity: very popular (1) | x | x |
| r59 | Popularity: popular (1) | x | x |
| r60 | Popularity: less popular (1) | x | x |
| r61 | `matches_preferences` | x | |

Notes:
- **`~` in r39, r43, r45, r46, r52 and r53:** Prolog adds points for each value that matches. Drools counts
  once per category. This is the cause of 30 against 28 points for the movie `tt0083096` and the user
  `carla`.
- **r41:** the rule exists in Drools but never fires. Nothing fills `Movie.similarTo` (`addSimilarTo()` is
  never called) and, even if something did, it would not filter by a rating of 4 or more.
- **r55–r60:** Drools joins the 3 era rules in one rule and the 3 popularity rules in another.
- **r61:** Prolog does not use it to filter. Drools needs at least one positive reason to create the
  recommendation.

## 4. Calculation at query time (outside the numbering)

| Item | Prolog | Drools |
|---|:-:|:-:|
| Score (genre 40, IMDb 3 × rating, director 10, actor 10, the rest capped at 9) | x | x |
| `status`: main or alternative | x | x |
| Ordering (main first, then score and rating) | x | ~ |
| `satisfied_requirements` | x | |
| `unmet_preferences` | x | ~ |

Notes:
- **Ordering:** Drools breaks ties by neither rating nor id. With equal scores the order differs (for
  example `joao`).
- **`satisfied_requirements`:** in Drools it is always `[]`.
- **`unmet_preferences`:** Drools fills fewer items (46 against 52 for the 10 current users).

## 5. Totals

| | Number of rules |
|---|:-:|
| Prolog (r1–r69) | 69 |
| Drools equivalents (`x`) | 43 |
| Drools with different behaviour (`~`) | 7 (r39, r43, r45, r46, r52, r53, r65) |
| No equivalent in Drools | 19 |

Of the 19 with no equivalent, 17 are helper facts with no effect on the result (r9, r10, r15–r18,
r22–r32). The two that matter are **r41** and **r61**.

## 6. What was checked

With the stack running (Prolog on 8081, Drools on 8082):
- **HTTP status and errors:** the same in the shared endpoints.
- **Movies:** 100 movies compared; the derived fields match, except `rating_mpa` (`""` against `null`, 19
  movies) and one genre with two spaces (`tt0274932`).
- **Similarity (`/api/recomendacoes`):** identical for all 100 movies.
- **Recommendations by user:** identical (movies, score, `status` and order) for 8 of the 10 users. `carla`
  differs in one score (r39) and `joao` in the order of ties.

## 7. Proposed fixes

1. **r41 in Drools:** fill the similarity from the watched movies rated 4 or more with a similarity of 7 or
   more.
2. **Add per value:** in r39, r43, r45, r46, r52 and r53, add points for each value that matches, as Prolog
   does.
3. **Tie-breaker:** order by `(status, -score, -rating, id)`, as Prolog does.
4. **Optional:** fill `satisfied_requirements` and `reasons[].value` in Drools; decide whether r61 should
   also filter in Prolog.

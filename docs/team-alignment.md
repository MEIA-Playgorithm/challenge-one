# Team alignment

## Goal

Write down all the rules in one deliverable document. Both engines are then aligned to that document.

## 1. Define the rules (the deliverable)

One document with all the rules (r1–r69), each with: **description, condition, effect (exclude / points /
status), and an example**. Today the rules exist only as code in two places and the two disagree.

Starting point: [Rules: Prolog vs Drools](rules-prolog-vs-drools.md).

Decide in the meeting:

1. **Format of the document** (one table, or one page per rule) and **who writes each part**.
2. **Rules to settle first**, because the engines differ:
   - r61: does a movie need at least one positive reason to be recommended? (Prolog: no. Drools: yes.)
   - r39, r43, r45, r46, r52, r53: points per matching value, or once per category? (Prolog: per value.)
   - r41: similarity to liked movies. Drools never applies it.
   - Mandatory genre, director and actor: they exist only in Drools and the CSV has no such columns. Keep or drop?
   - Ties in the score: order by `(status, -score, -rating, id)`.
3. **Weights** (`40/30/10/10/9`, minimum personal rating 4, minimum similarity 7): our choice, not the
   expert's. Keep them in the document, in one place.
4. **Items to validate with the expert:** the meaning of rejecting a language; a failed requirement vs unknown
   information; whether `slow|medium` means "any of these".

## 2. Align the engines

Once the rules are written, fix the engine that differs. Full list: [Prolog vs Drools](prolog-vs-drools.md).

The **contract** (what the API returns) also needs one answer for both engines:

| Field | Prolog | Drools | Decide |
| --- | --- | --- | --- |
| `rating_imdb` | `"8,2"` | `8.2` | number or text |
| `duration` | `"2h 20m"` | `140` | text or minutes |
| `rating_mpa` empty | `""` | `null` | which one |
| `reasons` | real value + `rating` | `"preferred"` | Drools follows Prolog |

Proposal: the Prolog contract is the reference, and Drools follows it.

Drools fixes (in order):

1. A user with no preferences gets 0 recommendations (affects every new user).
2. Reload with an invalid CSV is accepted (Prolog answers `422`).
3. No tie-breaker, so the order changes between requests.
4. Score differences (`Smash Palace` for `carla`: 30 vs 28) and `unmet_preferences`.
5. `satisfied_requirements` is always `[]`; `reasons` has no real value.
6. Columns not read (`vote`, `budget`, `win`, `nomination`, `oscar`, `filming_location`, `production_company`).
7. Small differences: `Sword Sandal` filter, error format, `OPTIONS`.

Prolog fixes: broken accents (`csv_source.pl` ignores the UTF-8 charset), and `how` / `why-not` only in the
console.

## 3. Other decisions

- **Explanations (`how`, `why-not`, `trace`):** only Drools has them as endpoints. Does the frontend need them?
  If yes, Prolog needs them too.
- **"People and Origins" tab:** empty. Build it or drop it?
- **Missing from the interview:** content and language, platforms, sagas (all need new data); similar users,
  rating by genre, tie-break by similarity (see [Implementation vs interview](implementation-vs-interview.md)).

## 4. Housekeeping

- Open the Pull Request from `feature/49_frontend-integration-api` into `development` (the branch is already
  pushed).
- Commit `docs/team-alignment.md` and the link in the `README.md`.

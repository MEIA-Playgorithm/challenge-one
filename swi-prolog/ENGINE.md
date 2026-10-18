# Inference engines and the recommendation model

This document explains how the Prolog production engines work, the format of the user data and how the
recommendations are calculated. To get everything running, see the [README](README.md). For the HTTP API, see
[api/README.md](api/README.md).

The `swipl` commands in this document run inside the `swi-prolog` folder. Without the `MOVIES_CSV` and
`USERS_CSV` variables, the CSV files are read from `../knowledge_base/`.

The names of the predicates and facts (`carrega_bc`, `arranca_motor`, `facto`, `como`, `whynot`...) and the
text the console prints are in Portuguese, as in the code. They are kept as they are.

## Contents

1. [The knowledge base](#the-knowledge-base)
2. [Querying the movies](#querying-the-movies)
3. [Engine 2: explanations](#engine-2-explanations)
4. [The dialogue: choose an experience and ask "why?"](#the-dialogue-choose-an-experience-and-ask-why)
5. [The users CSV format](#the-users-csv-format)
6. [The user rules](#the-user-rules)
7. [Querying users and rules in the console](#querying-users-and-rules-in-the-console)
8. [Recommendations](#recommendations)

---

## The knowledge base

The base has 100 movies (`movies.csv`) and the users' survey answers (`users.csv`). `movies_loader.pl`
loads the movies as independent facts, one per attribute:

`Id, Title, Vote, Year, Duration, RatingMPA, RatingIMDB, Budget, Director, Writer, Star, Genre, Country, FilmingLocation, Company, Language, Win, Nomination, Oscar`

`user_bc.pl` loads the users and `rules_users.pl` interprets them. Rules 1–33 (`rules_movies.pl`) classify
the movies. Rules 34–65 (`rules_users.pl`) match users with movies. Both engines (`sp_exp1.pl` and
`sp_exp2.pl`) run the same rules.

---

## Querying the movies

### Load the base

```bash
swipl sp_exp1.pl
```

At the Prolog prompt:

```prolog
?- carrega_bc.
% When it asks for the name of the knowledge base:
?- 'filmes_bc.pl'.
true

?- arranca_motor.
% This produces about 28000 facts about the movies.
```

### Ask questions

Write each query with a full stop. Use `;` to ask for another solution, or Enter to finish.

```prolog
% The genres of a movie
facto(_, genre(tt0372784, Genre)).

% Fast-paced movies with little violence
facto(_, pace(Id, fast)),
facto(_, violence(Id, low)),
facto(_, movie(Id, Title)).

% Themes or psychological intensity
facto(_, themes(Id, Theme)).
facto(_, psychological_intensity(Id, high)).

% Movies similar to a movie
facto(_, similar_movie(tt0372784, Other)),
facto(_, movie(Other, Title)).

% Recommendations with a similarity score of at least 7
facto(_, similarity_score(tt0372784, Other, Score)),
Score >= 7,
facto(_, movie(Other, Title)).

% Which rule produced a conclusion
facto(N, pace(tt0372784, fast)),
justifica(N, Rule, SourceFacts).

% All the action movies at once
findall(Title,
        (facto(_, genre(Id, 'Action')), facto(_, movie(Id, Title))),
        Movies).

% Action movies with a fast pace
facto(_, genre(Id, 'Action')),
facto(_, pace(Id, fast)),
facto(_, movie(Id, Title)).

% The pace and the complexity of one movie
facto(_, pace(tt0372784, Pace)).
facto(_, complexity(tt0372784, Complexity)).

% Fast-paced movies with low complexity
facto(_, pace(Id, fast)),
facto(_, complexity(Id, low)),
facto(_, movie(Id, Title)).
```

To get only the movie with the highest similarity:

```prolog
% findall gathers every result, without grouping by fact number.
findall(Score-Id-Title,
        (facto(_, similarity_score(tt0372784, Id, Score)),
         facto(_, movie(Id, Title))),
        Results),
sort(Results, List),
last(List, Score-Movie-Title).
% If two movies tie, it returns the last id in the standard Prolog order.
% With no results, the query fails (false).
```

---

## Engine 2: explanations

Start a new session and choose only one engine:

```bash
swipl -s sp_exp2.pl
```

At the Prolog prompt:

```prolog
carrega_bc.
'filmes_bc.pl'.
arranca_motor.

% How was it concluded that this movie has a fast pace?
facto(N, pace(tt0372784, fast)), como(N).

% Why was it not classified with a slow pace?
whynot(pace(tt0372784, slow)).
```

The movie queries above work in both engines. Engine 2 also supports `nao` (not) conditions in the rules and
keeps the justifications. A negation checks that something is absent at run time, so bind the variables
first with positive conditions. After you change the data, reload the facts before you calculate again: the
engine does not remove earlier conclusions by itself.

---

## The dialogue: choose an experience and ask "why?"

The dialogue in [rules_dialog.pl](rules_dialog.pl) starts with a choice between seven experiences and then
asks only the questions of the chosen branch. It needs `sp_exp2.pl` and a current user that exists in the
base.

### Start the dialogue

In the `swi-prolog` folder, start a new session:

```bash
swipl -q -s sp_exp2.pl
```

At the Prolog prompt, load the base and select Ana:

```prolog
consult(filmes_bc).
retractall(resposta_utilizador(_, _)).

% Ana already exists as user(ana) in the facts loaded from the CSV.
regista_facto_utilizador(utilizador_atual(ana)).
arranca_motor.
```

`filmes_bc.pl` already loads `rules_dialog.pl`. Besides the inference messages, the first question appears:

```text
ana, que experiência te apetece ter com o filme de hoje?
Opções: [emocao,comedia,acao,misterio,terror,ficcao_cientifica,fantasia]. Escreve uma opção ou porque, terminando com ponto.
```

Type one of the options exactly as shown, for example `comedia.`. In this question, `sim.` and `nao.` are not
valid choices. An invalid option prints a message and repeats the question, without saving a choice.

### Use `porque.` before you answer

`porque.` is an answer during the interaction started by `arranca_motor.`, not a stand-alone query at the
`?-` prompt. It works in the first choice and in the follow-up questions. It shows the rule being evaluated,
its conditions, the information it needs and the actions it will take if every condition is met. Then it
repeats the question, without recording a choice or an affirmative answer.

In the first question, `porque.` explains the rule `dialogo_experiencia`. Choosing `comedia.` records
`escolha(experiencia(ana), comedia)` in the working memory and lets the engine infer
`experiencia_sessao(ana, comedia)` and `sugerir_genero(ana, 'Comedy')`. Then this appears:

```text
ana, preferes humor ligado a uma história romântica? (sim/nao/porque, terminar com .)
```

Here `porque.` explains the rule `dialogo_comedia_2`. Answering `sim.` also lets the engine infer
`sugerir_genero(ana, 'Romantic Comedy')`. Answering `nao.` keeps the comedy suggestion but does not add the
romantic comedy.

| Answer | Where to use it | Effect |
| --- | --- | --- |
| `comedia.` or another listed option | The first choice | Saves the choice and selects the branch |
| `porque.` | Any question | Explains the current rule and repeats the question |
| `sim.` | A follow-up question | Saves the answer and adds the fact that was asked |
| `nao.` | A follow-up question | Saves the answer without adding the fact; the condition fails |

Every answer ends with a full stop. Option names are lower case, with no accents: science fiction is written
`ficcao_cientifica.`.

### The paths in `rules_dialog.pl`

| Choice | First suggestion | Follow-up question and the result of `sim.` |
| --- | --- | --- |
| `emocao.` | Selects the emotional branch | A story that moves you → `perfil_sessao(U, emocional)`; realistic themes → `'Drama'`; accepting a sad ending → `sugerir_tom(U, triste)` |
| `comedia.` | `'Comedy'` | Humour tied to a love story → `'Romantic Comedy'` |
| `acao.` | `'Action'` | Following an adventure → `'Adventure'` |
| `misterio.` | `'Mystery'` | Suspense and tension → `'Thriller'` |
| `terror.` | `'Horror'` | Supernatural elements → `preferencia_sessao(U, sobrenatural)` |
| `ficcao_cientifica.` | `'SciFi'` | Societies dominated by technology → `'Cyberpunk'` |
| `fantasia.` | `'Fantasy'` | A quest or journey → `'Quest'` |

The genres in the table are conclusions of the form `sugerir_genero(U, Genre)`. In the emotional branch,
each question depends on an affirmative answer to the previous one: `dialogo_1` infers the emotional
profile, `dialogo_2` suggests Drama and `dialogo_3` suggests the sad tone. A negative answer stops the
chain. In the other branches the choice already allows the first genre suggestion, and the next question adds
a suggestion or a preference if the answer is affirmative.

### Look at the choice, the answers and the explanations

After you finish the comedy example:

```prolog
% The choice that was given and the experience that was inferred.
facto(_, escolha(experiencia(ana), Experience)).
facto(_, experiencia_sessao(ana, Experience)).

% The answer to the follow-up question.
resposta_utilizador(prefere_romance_com_humor(ana), Answer).

% If you answered sim, explain the extra suggestion.
facto(N, sugerir_genero(ana, 'Romantic Comedy')), como(N).

% If you answered nao, investigate why that suggestion is missing.
whynot(sugerir_genero(ana, 'Romantic Comedy')).

% Running the inference again does not repeat the questions you answered.
arranca_motor.
```

The first choice is stored in `facto/2` as `escolha(experiencia(U), Value)`. The follow-up answers are stored
in `resposta_utilizador/2`, by fact and user, and the affirmative ones also add the fact to the working
memory. A `nao.` answer does not create an explicit negation fact. This data stays in memory and is not saved
to the CSV.

`porque.` explains the rule being evaluated. `como/1` walks through the justifications of the conclusions
already reached. `whynot/1` investigates a missing conclusion without asking new questions. The genre, tone
and session suggestions do not change the score of `user_recommendation/4` yet.

### Repeat the dialogue or change user

To choose another experience or start with another user, restore the CSV facts and clear the answers. For
example, to select Inês:

```prolog
carrega_factos_filmes.
retractall(resposta_utilizador(_, _)).
regista_facto_utilizador(utilizador_atual(ines)).
arranca_motor.
```

Restoring removes the earlier choice, the selection of Ana, the facts added by the interaction and the
inferred conclusions. Clearing only `resposta_utilizador/2` is not enough: the choice and the affirmative
facts would stay in the base. To repeat with Ana, use `ana` instead of `ines`.

### Define choices, questions and texts

`opcoes_pergunta/2` defines the values accepted in the first choice and `texto_pergunta/2` gives the text that
is shown:

```prolog
opcoes_pergunta(experiencia(_),
    [emocao, comedia, acao, misterio, terror, ficcao_cientifica, fantasia]).

texto_pergunta(experiencia(U), Texto) :-
    format(atom(Texto),
           '~w, que experiência te apetece ter com o filme de hoje?', [U]).
```

The engine interprets the condition `escolha(experiencia(U), Experience)`. The key `experiencia(U)` must be
fully bound, and the value `Experience` is filled with the selected option. In the first rule, `user(U)` and
`utilizador_atual(U)` identify the person first. With no current user, the dialogue does not start.

For follow-up questions, `perguntavel/1` declares the information that may be asked for and
`texto_pergunta/2` defines the sentence:

```prolog
perguntavel(prefere_romance_com_humor(_)).

texto_pergunta(prefere_romance_com_humor(U), Texto) :-
    format(atom(Texto),
           '~w, preferes humor ligado a uma história romântica?', [U]).
```

The engine asks these questions only when the condition is fully bound, the fact does not exist yet and no
answer is saved. The experience conditions and the facts inferred earlier decide which questions are
reached. Without a specific text, the engine uses a generic question.

---

## The users CSV format

The pipeline loads `users.csv` through `user_bc.pl` and applies `rules_users.pl` to the profiles and to the
movie facts. It does not generate Prolog code from the text it receives: the data are `user_fact/1` facts in
memory. The file in the repository has 10 fictional users with varied preferences to try the
recommendations: `ana`, `bruno`, `carla`, `diogo`, `eva`, `filipe`, `ines`, `joao`, `mariana` and `tiago`. It
includes all the optional columns described below.

The base format has one line per user and lists separated by `|`:

```csv
user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages
demo,25,tt0054215,tt0372784,Action|SciFi,Romance,English,
```

Use movie ids from the catalogue and genre and language names from the movies CSV. `Sci-Fi` is normalised to
`SciFi`. List fields may be empty. The `user_id` must be unique and not empty. The `age` may be empty or an
integer from 0 to 120. References to movies outside the catalogue produce no similarity recommendations.
Loading validates the file before it replaces the profiles in memory.

### Optional preferences

After the eight original columns, the header of `users.csv` has the columns below. They may be empty or hold
several values separated by `|`. A file with only the eight original columns, or with a subset of the new
columns, is also accepted. Invalid enumerated values reject the load.

| Column | Values | Points per match |
| --- | --- | --- |
| `preferred_directors` | `director` names, for example `Christopher Nolan` | 10 |
| `preferred_writers` | `writer` names | 2 |
| `preferred_stars` | `star` names, for example `Christian Bale` | 10 |
| `preferred_countries` | `country_origin` names, for example `United States` | 1 |
| `preferred_subgenres` | Subgenres recognised in `rules_movies.pl`, for example `Superhero` | 3 |
| `preferred_pace` | `slow`, `medium`, `fast` | 2 |
| `preferred_complexity` | `low`, `medium`, `high` | 2 |
| `preferred_violence` | `low`, `medium`, `high` | 2 |
| `preferred_humor` | `low`, `medium`, `high` | 2 |
| `preferred_psychological_intensity` | `low`, `medium`, `high` | 2 |
| `preferred_emotional_tones` | `tense`, `dark`, `sad`, `lighthearted`, `romantic`, `reflective`, `exciting` | 2 |
| `preferred_themes` | `love`, `family`, `growing_up`, `crime`, `justice`, `war`, `history`, `technology`, `supernatural`, `exploration`, `psychology`, `music`, `sport`, `life_story` | 3 |
| `preferred_audience` | `mainstream`, `niche` | 1 |
| `preferred_eras` | `classic` (before 2000), `modern` (2000–2019), `recent` (2020 onwards) | 1 |
| `preferred_popularity` | `very_popular` (1 million votes or more), `popular` (500 thousand to 999,999), `less_popular` (under 500 thousand) | 1 |

These preferences add points; they are not mandatory limits. `preferred_violence=low` favours low violence
but does not exclude other levels. The existing exclusions still win. Repeated values do not add extra
points. Inferred attributes need `arranca_motor` to run and follow the heuristics in `rules_movies.pl`; a
missing value (`unknown`) does not match a preference. Era and popularity use the catalogue's years and
votes, without correcting the original data. The weights in the table are subject to the group limits
described in [How the score is calculated](#how-the-score-is-calculated).

Example of a file with a subset of the extra columns:

```csv
user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages,preferred_directors,preferred_pace,preferred_themes,preferred_eras
demo,25,,,Action,,English,,Christopher Nolan,fast,justice|exploration,modern
```

The loader creates, for example, `user_fact(prefers(demo,pace,fast))`. `rules_users.pl` matches this fact with
`facto(_,pace(Movie,fast))`, adds 2 points and includes `pace(fast)` in the explanation. In the API this is
`{"type":"pace","value":"fast"}`. No rule written in the CSV is ever run.

### Mandatory limits and the session audience

Optional CSV columns (filled in the 10 fictional profiles, with limits and rejections that agree with their
wishlists):

| Column | Format and meaning |
| --- | --- |
| `max_duration_minutes` | Integer 1–1440; the maximum duration, inclusive |
| `year_from`, `year_to` | Integers 1800–3000; an inclusive range; you may give only one end |
| `required_languages` | Languages separated by `\|`; one of them is enough |
| `disliked_directors`, `disliked_stars` | Exact catalogue names separated by `\|`; any match excludes |
| `session_min_age` | Integer 0–120; the age of the youngest viewer, which replaces the profile's age for this session |
| `min_rating` | Number 0–10; the IMDb rating the user wants |
| `rating_tolerance` | Number 0–10; the margin below the minimum; 0 by default |
| `rating_required` | `true` or `false`; `true` allows no tolerance; `false` by default |

Empty fields impose no limit. With no age in the profile and no session age, age suitability cannot be
checked, and the engine does not assume an adult audience. The catalogue has no descriptors of bad language:
languages and the MPA rating do not prove that a movie has no swearing. The language information refers to
the catalogue and does not guarantee dubbed or subtitled versions.

With `min_rating=8`, `rating_tolerance=0.5` and `rating_required=false`: ratings of 8 or more are `main`,
ratings from 7.5 (inclusive) to 8 (exclusive) are `alternative`, and ratings below 7.5 are excluded. With
`rating_required=true`, every rating below 8 is excluded. The tolerance never relaxes the duration, the
period, the languages, the rejections or the age. Setting a tolerance or the mandatory flag without a minimum
is a validation error. Reversed year ranges are also rejected before the profiles are replaced.

When the information needed to check an explicit limit is missing, the movie is excluded. Durations such as
`2h 30m`, `2h` and `90m`, and ratings with a comma, are normalised for the calculation, and the original
values are kept in the movie object. The IMDb rating is still absolute: there is no calibration by genre, and
no statistical adjustment was invented from this sample.

Example profile for a session with children:

```csv
user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages,max_duration_minutes,year_from,year_to,required_languages,session_min_age,min_rating,rating_tolerance,rating_required
familia,35,,,Animation|Family,Horror,English,,100,2000,2026,English|Portuguese,8,7,0.5,false
```

Rules 62–65 add the rejections of people, the failed limits and the final exclusion.
`user_constraints.pl` holds the normalisation, the checks and the calculation.
`facto(_,exclusion_reason(User,Movie,Reason))` shows the cause of an exclusion, and
`recommendation_explanation(User,Movie,Status,Checks,Unmet)` explains the eligible movies. In the API,
requirements and unmet preferences have the form `{"type":"rating_below_target","arguments":[7.5,8]}` or
`{"type":"duration","arguments":[95,100]}`. The positive reasons keep the earlier form. The client must not
add the isolated rule weights: use `score_breakdown`, which already applies the group limits.

### Watch history with a personal rating, and rewatch requests

`watched` holds `movie=rating` pairs separated by `|`, without square brackets:

```text
tt0087469=4|tt7798634=1
```

Ratings are integers from 0 to 5. 0 means watched but not rated; 1–2 are negative ratings; 3 is neutral; 4–5
mean the user liked the movie. The threshold 4 is a policy that can be adjusted in rule 41. Ratings 0–3 give
no similarity bonus and exclude no other movie. There are no averages of personal ratings. Old ids without
`=rating` are accepted as rating 0. Malformed entries, ratings out of range and duplicate movies in the
history are rejected before the profiles in memory are replaced.

The loader creates two facts for each entry:

```prolog
% Examples of loaded facts:
user_fact(watched(ana, tt0087469)).
user_fact(user_movie_rating(ana, tt0087469, 4)).
% Query the whole history and its ratings:
user_fact(user_movie_rating(ana, Movie, Rating)).
```

Rule 41 matches ratings of 4 or more with a similarity of 7 or more and produces
`liked_similarity(Reference)`. The total contribution stays at 1 point at most, even with several liked
references. In the API the reason keeps `type: liked_similarity` and `movie_id`. This personal rating (0–5) is
independent of the IMDb rating (0–10).

`allow_rewatch=true` lets watched movies be recommended, whatever the rating. Empty or `false` keeps the
exclusion. The other requirements stay mandatory. There is no separate column for liked movies.

The examples for Ana and Carla were applied, keeping Carla's earlier history. The other watched movies
became rating 0, because no personal ratings had been recorded. A positive rating on a horror movie does not
cancel a rejection of horror for the current session. After you edit the CSV, run `carrega_factos_filmes.`
and `arranca_motor.` in the console, or call `POST /api/reload/users` if the API is running.

---

## The user rules

`rules_users.pl` holds rules 34–65 in the form `regra N se [...] entao [cria_facto(...)].`, sharing the
engine with the movie rules 1–33. `rules_user.pl` is kept as a compatibility file. Loading also copies the
`user_fact/1` data into numbered `facto/2` facts, so the conclusions can be justified with the survey data.

The rules infer `preference_reason(User,Movie,Reason,Weight)`, `excluded_movie(User,Movie)` and
`matches_preferences(User,Movie)`. A preference match can exist for an excluded movie.
`user_recommendation/4` applies the exclusions and adds up the score only at query time, after the engine
finishes, so partial results are never stored.

After you change the CSV, reload the facts and run the engine again (`load_users` on its own only updates
`user_fact/1`):

```prolog
carrega_factos_filmes.
arranca_motor.
user_recommendation(demo, Movie, Score, Reasons).
facto(N, preference_reason(demo, Movie, pace(fast), 2)).
% In sp_exp2, use the N from the line above:
como(N).
```

Violence, pace and the other attributes still classify movies. The new conclusions relate each user to a
movie.

---

## Querying users and rules in the console

`users.csv` has 10 fictional users: `ana`, `bruno`, `carla`, `diogo`, `eva`, `filipe`, `ines`, `joao`,
`mariana` and `tiago`. Each line holds the age, the watched movies, the wishlist and the preferences.
Multiple values are separated by `|`, and an empty field defines no preference. Movies are identified by the
catalogue id, for example `tt0870154`.

In the project folder, start a session with:

```bash
swipl -q -s filmes_bc.pl
```

This loads both CSV files, the movie rules and `rules_users.pl`, using `sp_exp1.pl` by default. At the Prolog
prompt, run:

```prolog
arranca_motor.
```

If you already loaded `filmes_bc.pl` and ran the engine in the current session, go straight to the queries.

### Query the user data

`user_fact/1` holds the data loaded from the CSV. Loading the base also copies it to `facto/2`, where the
engine reads the premises of the rules.

```prolog
% List the 10 users in a single answer.
findall(User, user_fact(user(User)), Users).

% The age of Inês (19).
user_fact(user_age(ines, Age)).

% Preferred genres: Adventure, Fantasy and Comedy.
user_fact(likes_genre(ines, Genre)).

% Rejected genre: Horror.
user_fact(dislikes_genre(ines, Genre)).

% Preferred languages: English and Portuguese.
user_fact(likes_language(ines, Language)).

% Preferred characteristics: pace, themes, director, actors and so on.
user_fact(prefers(ines, Attribute, Value)).

% A movie Inês watched: Hotel Transylvania 2.
user_fact(watched(ines, Movie)), facto(_, movie(Movie, Title)).

% A movie on her wishlist: Jungle Cruise.
user_fact(wishlist(ines, Movie)), facto(_, movie(Movie, Title)).

% The same preference in the numbered base that the engine uses.
facto(N, prefers(ines, pace, fast)).
```

### Query the conclusions of the rules

Rules 34–37 infer the reasons for exclusion, rules 38–60 infer the reasons and their weights, and rule 61
identifies the user–movie pairs with matching preferences. Rules 62–64 add the rejections of actors and
directors and the mandatory limits, and rule 65 concludes the final exclusion. These queries need
`arranca_motor` to have finished.

```prolog
% Why Jungle Cruise matches Inês's preferences.
preference_reason(ines, tt0870154, Reason, Weight).

% Is there at least one matching preference?
matches_preferences(ines, tt0870154).

% List the movies excluded for Inês.
findall(Movie-Title,
        (excluded_movie(ines, Movie), facto(_, movie(Movie, Title))),
        Excluded).

% Hotel Transylvania 2 is excluded because Inês has already watched it.
facto(N, excluded_movie(ines, tt2510894)),
justifica(N, Rule, SourceFacts).

% Rule 47 gives 2 points to a fast-pace match.
facto(N, preference_reason(ines, tt0870154, pace(fast), 2)),
justifica(N, Rule, SourceFacts).
```

`matches_preferences/2` does not guarantee a recommendation: a movie can match preferences and be excluded at
the same time.

After you edit the CSV, rebuild the facts and the inferences:

```prolog
carrega_factos_filmes.
arranca_motor.
```

Running only `load_users` updates `user_fact/1` but does not rebuild the numbered facts or remove old
conclusions. `rules_user.pl` is only a compatibility file; the rules are in `rules_users.pl`.

---

## Recommendations

After you load the base and run the engine, `user_recommendation/4` returns the movie, the score and the
reasons. It excludes movies that were already watched, that have rejected genres or languages, or that fail
the age policy. The other preferences add points; they are not mandatory.

### Recommendations for Inês

```prolog
% Get recommendations, one solution at a time (not sorted by score).
user_recommendation(ines, Movie, Score, Reasons),
facto(_, movie(Movie, Title)).

% Only the recommended ids.
recommend(ines, Movie).

% The score and the reasons for one movie.
user_recommendation(ines, tt0870154, Score, Reasons).
```

With the current data, **Jungle Cruise** (`tt0870154`) is the best recommendation for Inês, with **88.8
points**. It matches adventure, fantasy, comedy, a fast pace, a high level of humour and the themes of
exploration and the supernatural, among other criteria. It is also on her wishlist and it is not in her
rejected genre, horror. The score is a sum of weights: it is not a percentage and it does not guarantee that
the user will like the movie.

### Sort and pick the best recommendation

The key of `recommendation_key/4` places `main` options before `alternative` ones, followed by score, rating
and id. `findall/3` returns an empty list when there are no recommendations.

```prolog
% List every recommendation by score.
findall(Key-Movie-Title-Score-Reasons,
        (user_recommendation(ines, Movie, Score, Reasons),
         facto(_, movie(Movie, Title)),
         recommendation_key(ines, Movie, Score, Key)),
        Candidates),
sort(Candidates, Ranked).

% Get only the best recommendation.
findall(Key-Movie-Title-Score-Reasons,
        (user_recommendation(ines, Movie, Score, Reasons),
         facto(_, movie(Movie, Title)),
         recommendation_key(ines, Movie, Score, Key)),
        Candidates),
sort(Candidates, [_-BestMovie-BestTitle-BestScore-BestReasons|_]).
```

The second query returns `false` if there is no candidate. For another profile, replace `ines` with one of
the ids in the CSV, for example `diogo` or `carla`.

### How the score is calculated

The score is calculated by groups, after the exclusions are applied:

| Group | Maximum contribution |
| --- | --- |
| At least one preferred genre | 40 |
| IMDb rating | 30 (`3 × rating`) |
| At least one preferred director | 10 |
| At least one preferred actor | 10 |
| The other reasons, including the wishlist and the history | 9 |

Several actors or genres do not multiply the contribution of the group. The other reasons keep the weights
of their rules, but their sum is limited to 9 points. This score replaces the earlier sum without limits. It
is not a percentage. Ratings are absolute, with no adjustment by genre.

```prolog
score_breakdown(ines, tt0870154, Breakdown).
recommendation_explanation(ines, tt0870154, Status, Checks, Unmet).
```

`Status` is `main` or `alternative`. `Checks` lists the requirements that were checked. `Unmet` identifies
the preferences that were not met, including a rating below the target when the tolerance allows it.
Profiles with no scoring preferences can also receive eligible movies, ordered by rating.

Exclusions win over the score and the wishlist. For example, João rejects `Horror`, so `tt0067500` is
excluded. His wishlist now holds the western `The Undefeated` (`tt0065150`), which fits his profile:

```prolog
excluded_movie(joao, tt0067500).
% true

recommend(joao, tt0067500).
% false
```

For minors, the policy allows G and PG, allows PG-13 from age 13 and excludes missing or unrecognised
ratings. R and NC-17 need age 18. The recommendations for Diogo, who is 12, also go through this filter.

### Explain a recommendation with engine 2

In a new session, start:

```bash
swipl -q -s sp_exp2.pl
```

Then, at the Prolog prompt:

```prolog
carrega_bc.
'filmes_bc.pl'.
arranca_motor.

% See the whole recommendation and its reasons.
user_recommendation(ines, tt0870154, Score, Reasons).

% Explain one of the reasons, including the premises that produced it.
facto(N, preference_reason(ines, tt0870154, pace(fast), 2)),
como(N).

% Explain the exclusion of a movie that was already watched.
facto(N, excluded_movie(ines, tt2510894)),
como(N).

% Investigate a reason that was not inferred.
whynot(preference_reason(ines, tt0870154, pace(slow), 2)).
```

Use `como/1` and `whynot/1` on inferred facts, such as `preference_reason/4` or `excluded_movie/2`.
`user_recommendation/4` is a helper query that gathers the results, not a conclusion produced by
`cria_facto`.

# Flowchart: movie recommendation system

## What the project contains today

The flowchart below describes the recommendation flow. It is based on the goal of the system and on the
interview with the expert Joao Mota. The project implements it in two engines:

- the Prolog engine (`swi-prolog/`), documented in [swi-prolog/README.md](../swi-prolog/README.md);
- the Drools engine (`drools/`), documented in [drools/README.md](../drools/README.md);
- the knowledge base service (`knowledge_base/`), which serves the movies and users to both engines;
- the frontend (`frontend/`), where the user edits a profile and compares the recommendations.

## Knowledge extracted from the interview

The system should recommend movies that the user will probably enjoy, while also helping them discover new options. The recommendation should first respect mandatory criteria and only then calculate suitability through scoring.

Mandatory criteria when defined by the user:

- maximum duration;
- language;
- release period or year;
- age rating and content suitable for the actual audience;
- explicitly rejected genres, directors, or actors;
- already watched movie, except when the request allows rewatching.

Desirable preferences for scoring:

- preferred genre;
- minimum rating, with a possible tolerance margin;
- preferred director and actors;
- similarity to movies previously liked;
- movie belonging to a saga or series the user likes;
- availability on an accessible platform.

Suggested ranking hierarchy:

1. Mandatory restrictions.
2. Genre.
3. Rating, interpreted in the context of the genre.
4. Similarity to liked movies.
5. Director and actors.
6. Practical availability.

## The role of Prolog and Drools

The two engines are independent implementations of the same recommendation logic. Each one reads the movies and
the users from the knowledge base service, applies the same exclusions and scoring, and answers the same HTTP
API. They never exchange results: the frontend asks one or both and shows the answers side by side, so the
results can be compared.

- **Prolog** states the rules as production rules over facts (`swi-prolog/rules_movies.pl` and
  `swi-prolog/rules_users.pl`), and explains its conclusions with `como` and `whynot` in the console.
- **Drools** states them as forward-chaining rules over the facts in a rule unit (`rules.drl`), and exposes the
  explanations (`how`, `why-not`, `trace`) as endpoints.

## Sample flowchart

```mermaid
flowchart TD
    A([Start]) --> B[Frontend: choose a user and one or both engines]
    B --> C[Knowledge base serves movies.csv and users.csv]
    C --> D[Each engine reads the CSV files and builds its facts]

    D --> E{For each movie: does it violate a mandatory criterion?}
    E -- Yes --> F[Exclude the movie and store the reason]
    E -- No --> G[Add the points of every matching preference]

    G --> H[Apply the group limits to the score]
    H --> I{Is the rating below the minimum, within the tolerance?}
    I -- Yes --> J[Mark as alternative]
    I -- No --> K[Mark as main]

    J --> L[Rank: main first, then score, rating and id]
    K --> L
    L --> M{Are there eligible movies?}

    M -- No --> N[Return an empty list]
    M -- Yes --> O[Return the page with reasons and score breakdown]
    N --> P[Frontend shows each engine's answer]
    O --> P
    P --> Q([End])
```

## Example rules extracted

- If the movie belongs to an explicitly rejected genre, then it must be excluded.
- If the movie violates mandatory duration, language, or period, then it must be excluded.
- If the movie genre matches the preferred genre, then the score increases.
- If the rating is above the minimum, then the score increases.
- If the rating is close to the minimum and tolerance is allowed, then the movie can be an alternative.
- If the director or actors are among the preferred ones, then the score increases.
- If the movie has already been watched, then it should not be recommended, except when the user wants rewatch suggestions.
- If no movie satisfies all desirable preferences, then the closest alternatives should be shown, explaining what did not match.

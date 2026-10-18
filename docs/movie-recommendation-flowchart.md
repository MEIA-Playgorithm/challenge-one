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

Prolog can be used to represent facts and logical queries: movies, genres, actors, ratings, user restrictions, and similarity relationships.

Drools can be used to apply business rules with weights, exclusions, scoring, tolerance margins, and explanations. The same conceptual base should be maintained across both engines so that the results can be compared.

## Sample flowchart

```mermaid
flowchart TD
    A([Start]) --> B[Load movie catalogue]
    B --> C[Load user profile]
    C --> D[Normalise preferences and restrictions]

    D --> E[Send facts to Prolog]
    D --> F[Send facts to Drools]

    E --> G[Infer logical relationships]
    G --> G1[Similarity, compatible genre, watched movie, restrictions]

    F --> H[Apply business rules]
    H --> H1[Weights, tolerances, exclusions, bonuses, penalties]

    G1 --> I[Merge inference results]
    H1 --> I

    I --> J{Does the movie violate a mandatory criterion?}
    J -- Yes --> K[Exclude movie and store justification]
    J -- No --> L[Calculate recommendation score]

    L --> M[Calculate confidence]
    M --> N[Rank candidates]
    N --> O{Are there eligible candidates?}

    O -- No --> P[Show reasons for no recommendation]
    O -- Yes --> Q[Select Top N]
    Q --> R[Generate explanation]
    R --> S[Present recommendations]
    P --> T([End])
    S --> T
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

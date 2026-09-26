% ============================================================
% constraints.pl
% Movie Recommendation Expert System
% Hard Constraint Layer
% ============================================================
%
% PURPOSE
% -------
% Apply mandatory user restrictions before recommendation scoring.
%
% A hard constraint is different from a normal preference:
%
%   preference(User, Category, Value)
%       -> influences compatibility score
%
%   constraint(User, Type, Value)
%       -> can reject a movie completely
%
%
% Expected user facts:
%
%   constraint(User, Type, Value).
%
% Examples:
%
%   constraint(user1, max_runtime, 140).
%   constraint(user1, required_language, english).
%   constraint(user1, excluded_genre, documentary).
%   constraint(user1, max_gore, medium).
%   constraint(user1, max_age_rating, pg13).
%
%
% IMPORTANT
% ---------
% This file does NOT:
% - Calculate compatibility
% - Sum points
% - Normalize scores
% - Apply preference strength
% - Calculate confidence
% - Produce final explanations
%
% It only answers:
%
%   Does this movie violate any mandatory user constraint?
%
%
% MISSING DATA
% ------------
% A missing fact does not reject a movie. Required values
% reject only when a different value is already known.
% Exclusions and ceilings reject only when a banned or
% higher value is known. Unknown data is left for the
% confidence layer.
%
% ============================================================


% ============================================================
% 1. MAXIMUM RUNTIME
% ============================================================

violates_constraint(
    User,
    Movie,
    max_runtime(MaxRuntime, ActualRuntime)
) :-
    constraint(User, max_runtime, MaxRuntime),
    runtime(Movie, ActualRuntime),
    ActualRuntime > MaxRuntime.


% ============================================================
% 2. MINIMUM RUNTIME
% ============================================================

violates_constraint(
    User,
    Movie,
    min_runtime(MinRuntime, ActualRuntime)
) :-
    constraint(User, min_runtime, MinRuntime),
    runtime(Movie, ActualRuntime),
    ActualRuntime < MinRuntime.


% ============================================================
% 3. ALLOWED YEAR RANGE
% ============================================================

violates_constraint(
    User,
    Movie,
    year_outside_range(Year, MinYear, MaxYear)
) :-
    constraint(User, year_range, range(MinYear, MaxYear)),
    MinYear =< MaxYear,
    release_year(Movie, Year),
    (
        Year < MinYear;
        Year > MaxYear
    ).


% ============================================================
% 4. REQUIRED LANGUAGE
% ============================================================

violates_constraint(
    User,
    Movie,
    required_language_missing(RequiredLanguage, ActualLanguage)
) :-
    constraint(User, required_language, RequiredLanguage),
    original_language(Movie, ActualLanguage),
    ActualLanguage \= RequiredLanguage.


% ============================================================
% 5. EXCLUDED LANGUAGE
% ============================================================

violates_constraint(
    User,
    Movie,
    excluded_language(Language)
) :-
    constraint(User, excluded_language, Language),
    original_language(Movie, Language).


% ============================================================
% 6. REQUIRED GENRE
% ============================================================

violates_constraint(
    User,
    Movie,
    required_genre_missing(Genre)
) :-
    constraint(User, required_genre, Genre),
    movie(Movie),
    once(genre(Movie, _)),
    \+ genre(Movie, Genre).


% ============================================================
% 7. EXCLUDED GENRE
% ============================================================

violates_constraint(
    User,
    Movie,
    excluded_genre(Genre)
) :-
    constraint(User, excluded_genre, Genre),
    genre(Movie, Genre).


% ============================================================
% 8. REQUIRED SUBGENRE
% ============================================================

violates_constraint(
    User,
    Movie,
    required_subgenre_missing(Subgenre)
) :-
    constraint(User, required_subgenre, Subgenre),
    movie(Movie),
    once(subgenre(Movie, _)),
    \+ subgenre(Movie, Subgenre).


% ============================================================
% 9. EXCLUDED SUBGENRE
% ============================================================

violates_constraint(
    User,
    Movie,
    excluded_subgenre(Subgenre)
) :-
    constraint(User, excluded_subgenre, Subgenre),
    subgenre(Movie, Subgenre).


% ============================================================
% 10. REQUIRED AGE RATING
% ============================================================

violates_constraint(
    User,
    Movie,
    required_age_rating_missing(RequiredRating, ActualRating)
) :-
    constraint(User, required_age_rating, RequiredRating),
    age_rating(Movie, ActualRating),
    ActualRating \= RequiredRating.


% ============================================================
% 11. EXCLUDED AGE RATING
% ============================================================

violates_constraint(
    User,
    Movie,
    excluded_age_rating(Rating)
) :-
    constraint(User, excluded_age_rating, Rating),
    age_rating(Movie, Rating).


% ============================================================
% 12. MAXIMUM AGE RATING
% ============================================================

violates_constraint(
    User,
    Movie,
    age_rating_above_limit(MaxRating, ActualRating)
) :-
    constraint(User, max_age_rating, MaxRating),
    age_rating(Movie, ActualRating),
    rating_value(ActualRating, ActualValue),
    rating_value(MaxRating, MaxValue),
    ActualValue > MaxValue.


% ============================================================
% 13. MAXIMUM GORE LEVEL
% ============================================================

violates_constraint(
    User,
    Movie,
    gore_above_limit(MaxLevel, ActualLevel)
) :-
    constraint(User, max_gore, MaxLevel),
    gore_level(Movie, ActualLevel),
    level_value(ActualLevel, ActualValue),
    level_value(MaxLevel, MaxValue),
    ActualValue > MaxValue.


% ============================================================
% 14. MAXIMUM VIOLENCE LEVEL
% ============================================================

violates_constraint(
    User,
    Movie,
    violence_above_limit(MaxLevel, ActualLevel)
) :-
    constraint(User, max_violence, MaxLevel),
    violence_level(Movie, ActualLevel),
    level_value(ActualLevel, ActualValue),
    level_value(MaxLevel, MaxValue),
    ActualValue > MaxValue.


% ============================================================
% 15. MAXIMUM PSYCHOLOGICAL INTENSITY
% ============================================================

violates_constraint(
    User,
    Movie,
    psychological_intensity_above_limit(MaxLevel, ActualLevel)
) :-
    constraint(User, max_psychological_intensity, MaxLevel),
    psychological_intensity(Movie, ActualLevel),
    level_value(ActualLevel, ActualValue),
    level_value(MaxLevel, MaxValue),
    ActualValue > MaxValue.


% ============================================================
% 16. REQUIRED REALISM LEVEL
% ============================================================

violates_constraint(
    User,
    Movie,
    required_realism_missing(RequiredLevel, ActualLevel)
) :-
    constraint(User, required_realism, RequiredLevel),
    realism(Movie, ActualLevel),
    ActualLevel \= RequiredLevel.


% ============================================================
% 17. REQUIRED PACE
% ============================================================

violates_constraint(
    User,
    Movie,
    required_pace_missing(RequiredPace, ActualPace)
) :-
    constraint(User, required_pace, RequiredPace),
    pace(Movie, ActualPace),
    ActualPace \= RequiredPace.


% ============================================================
% LEVEL ORDERING
% ============================================================

level_value(low, 1).
level_value(medium, 2).
level_value(high, 3).

% MPAA certificates used by the movie catalog, lowest to highest.
rating_value(g, 1).
rating_value(pg, 2).
rating_value(pg13, 3).
rating_value(r, 4).
rating_value(nc17, 5).


% ============================================================
% QUERY HELPERS
% ============================================================

has_constraints(User) :-
    constraint(User, _, _).

rejected_movie(User, Movie) :-
    violates_constraint(User, Movie, _).

eligible_movie(User, Movie) :-
    movie(Movie),
    \+ violates_constraint(User, Movie, _).

constraint_violations(User, Movie, Violations) :-
    findall(
        Reason,
        violates_constraint(User, Movie, Reason),
        Violations
    ).

eligible_movies(User, Movies) :-
    findall(
        Movie,
        eligible_movie(User, Movie),
        Movies
    ).

rejected_movies(User, Results) :-
    findall(
        Movie-Violations,
        (
            movie(Movie),
            constraint_violations(User, Movie, Violations),
            Violations \= []
        ),
        Results
    ).

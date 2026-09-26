% ============================================================
% compatibility_rules.pl
% Movie Recommendation Expert System
% User-Movie Compatibility Rules
% ============================================================
%
% PURPOSE
% -------
% Compare user preferences against movie facts and inferred
% movie characteristics.
%
% Each successful compatibility rule produces:
%
%   compatibility(User, Movie, Reason, Points)
%
% Example:
%
%   compatibility(user1, scream, genre_match(horror), 3).
%
%
% IMPORTANT
% ---------
% This file defines INDIVIDUAL compatibility contributions.
%
% It does NOT:
% - Sum points
% - Normalize compatibility
% - Apply preference strength
% - Apply hard constraints
% - Calculate confidence
%
%
% SCORING
% -------
% Every attribute uses one shape. Mismatch points are the
% negation of that attribute's match points.
%
%   presence(Weight)
%       The preferred value is one of the movie's values.
%       Awards +Weight.
%       No penalty: these facts are not exclusive, so a
%       missing actor or genre is not evidence against the movie.
%
%   exclusive(Weight)
%       The movie has one value for the attribute.
%       Awards +Weight when the values are equal.
%       Awards -Weight when the values are opposites.
%       Any other pair scores nothing. medium is neutral
%       against low and high.
%
%   range(Weight, Tolerance)
%       Awards +Weight inside [Min, Max].
%       Awards +1 when the value falls outside that interval
%       by at most Tolerance.
%       Awards -Weight when it falls outside by more than Tolerance.
%       The three bands do not overlap.
%
% Weights in use:
%   4  subgenre
%   3  genre, runtime, director, theme, pace, gore,
%      character_archetype
%   2  year, decade, language, actor, character, humor,
%      realism, violence, popularity
%   1  age_rating, producer, trending, and every range near-miss
%
% Subgenre is the only weight above 3: a subgenre hit is a
% more specific signal than a genre hit.
%
%
% Expected predicates:
%
% users.pl
%   preference/3
%
% movies.pl
%   genre/2
%   runtime/2
%   release_year/2
%   age_rating/2
%   original_language/2
%   actor/2
%   director/2
%   producer/2
%   character/2
%   trending_status/2
%
% movies_inferences.pl
%   decade/2
%   subgenre/2
%   theme/2
%   humor_level/2
%   realism/2
%   pace/2
%   gore_level/2
%   violence_level/2
%   market_position/2
%   character_archetype/2
%
% ============================================================


% ============================================================
% 1. GENRE
% presence(3)
% ============================================================

compatibility(User, Movie, genre_match(Genre), 3) :-
    preference(User, genre, Genre),
    genre(Movie, Genre).


% ============================================================
% 2. SUBGENRE
% presence(4)
% ============================================================

compatibility(User, Movie, subgenre_match(Subgenre), 4) :-
    preference(User, subgenre, Subgenre),
    subgenre(Movie, Subgenre).


% ============================================================
% 3. RUNTIME
% range(3, 20 minutes)
% ============================================================

compatibility(User, Movie, runtime_match(Runtime, Min, Max), 3) :-
    preference(User, runtime, range(Min, Max)),
    runtime(Movie, Runtime),
    inside_range(Runtime, Min, Max).

compatibility(User, Movie, runtime_close(Runtime, Min, Max), 1) :-
    preference(User, runtime, range(Min, Max)),
    runtime(Movie, Runtime),
    runtime_tolerance(Tolerance),
    close_to_range(Runtime, Min, Max, Tolerance).

compatibility(User, Movie, runtime_mismatch(Runtime, Min, Max), -3) :-
    preference(User, runtime, range(Min, Max)),
    runtime(Movie, Runtime),
    runtime_tolerance(Tolerance),
    far_from_range(Runtime, Min, Max, Tolerance).


% ============================================================
% 4. RELEASE YEAR RANGE
% range(2, 5 years)
% ============================================================

compatibility(User, Movie, year_match(Year, Min, Max), 2) :-
    preference(User, year, range(Min, Max)),
    release_year(Movie, Year),
    inside_range(Year, Min, Max).

compatibility(User, Movie, year_close(Year, Min, Max), 1) :-
    preference(User, year, range(Min, Max)),
    release_year(Movie, Year),
    year_tolerance(Tolerance),
    close_to_range(Year, Min, Max, Tolerance).

compatibility(User, Movie, year_mismatch(Year, Min, Max), -2) :-
    preference(User, year, range(Min, Max)),
    release_year(Movie, Year),
    year_tolerance(Tolerance),
    far_from_range(Year, Min, Max, Tolerance).


% ============================================================
% 5. DECADE
% presence(2)
% ============================================================

compatibility(User, Movie, decade_match(Decade), 2) :-
    preference(User, decade, Decade),
    decade(Movie, Decade).


% ============================================================
% 6. AGE RATING
% presence(1)
% ============================================================

compatibility(User, Movie, age_rating_match(Rating), 1) :-
    preference(User, age_rating, Rating),
    age_rating(Movie, Rating).


% ============================================================
% 7. ORIGINAL LANGUAGE
% presence(2)
% ============================================================

compatibility(User, Movie, language_match(Language), 2) :-
    preference(User, language, Language),
    original_language(Movie, Language).


% ============================================================
% 8. ACTORS
% presence(2)
% ============================================================

compatibility(User, Movie, actor_match(Actor), 2) :-
    preference(User, actor, Actor),
    actor(Movie, Actor).


% ============================================================
% 9. DIRECTORS
% presence(3)
% ============================================================

compatibility(User, Movie, director_match(Director), 3) :-
    preference(User, director, Director),
    director(Movie, Director).


% ============================================================
% 10. PRODUCERS
% presence(1)
% ============================================================

compatibility(User, Movie, producer_match(Producer), 1) :-
    preference(User, producer, Producer),
    producer(Movie, Producer).


% ============================================================
% 11. CHARACTERS
% presence(2)
% ============================================================

compatibility(User, Movie, character_match(Character), 2) :-
    preference(User, character, Character),
    character(Movie, Character).


% ============================================================
% 12. THEMES
% presence(3)
% ============================================================

compatibility(User, Movie, theme_match(Theme), 3) :-
    preference(User, theme, Theme),
    theme(Movie, Theme).


% ============================================================
% 13. HUMOR
% exclusive(2)
% ============================================================

compatibility(User, Movie, humor_match(Level), 2) :-
    preference(User, humor, Level),
    humor_level(Movie, Level).

compatibility(User, Movie, humor_mismatch(Preferred, Actual), -2) :-
    preference(User, humor, Preferred),
    humor_level(Movie, Actual),
    opposite_level(Preferred, Actual).


% ============================================================
% 14. REALISM
% exclusive(2)
% ============================================================

compatibility(User, Movie, realism_match(Level), 2) :-
    preference(User, realism, Level),
    realism(Movie, Level).

compatibility(User, Movie, realism_mismatch(Preferred, Actual), -2) :-
    preference(User, realism, Preferred),
    realism(Movie, Actual),
    opposite_level(Preferred, Actual).


% ============================================================
% 15. PACE
% exclusive(3)
% ============================================================

compatibility(User, Movie, pace_match(Pace), 3) :-
    preference(User, pace, Pace),
    pace(Movie, Pace).

compatibility(User, Movie, pace_mismatch(Preferred, Actual), -3) :-
    preference(User, pace, Preferred),
    pace(Movie, Actual),
    opposite_pace(Preferred, Actual).


% ============================================================
% 16. GORE
% exclusive(3)
% ============================================================

compatibility(User, Movie, gore_match(Level), 3) :-
    preference(User, gore, Level),
    gore_level(Movie, Level).

compatibility(User, Movie, gore_mismatch(Preferred, Actual), -3) :-
    preference(User, gore, Preferred),
    gore_level(Movie, Actual),
    opposite_level(Preferred, Actual).


% ============================================================
% 17. VIOLENCE
% exclusive(2)
% ============================================================

compatibility(User, Movie, violence_match(Level), 2) :-
    preference(User, violence, Level),
    violence_level(Movie, Level).

compatibility(User, Movie, violence_mismatch(Preferred, Actual), -2) :-
    preference(User, violence, Preferred),
    violence_level(Movie, Actual),
    opposite_level(Preferred, Actual).


% ============================================================
% 18. POPULARITY / MARKET POSITION
% exclusive(2)
% ============================================================

compatibility(User, Movie, popularity_match(Position), 2) :-
    preference(User, popularity, Position),
    market_position(Movie, Position).

compatibility(User, Movie, popularity_mismatch(Preferred, Actual), -2) :-
    preference(User, popularity, Preferred),
    market_position(Movie, Actual),
    opposite_popularity(Preferred, Actual).


% ============================================================
% 19. TRENDING STATUS
% presence(1)
%
% unknown means the status was not recorded, so it is not
% evidence of a match.
% ============================================================

compatibility(User, Movie, trending_match(Status), 1) :-
    preference(User, trending, Status),
    trending_status(Movie, Status),
    Status \= unknown.


% ============================================================
% 20. CHARACTER ARCHETYPE
% presence(3)
% ============================================================

compatibility(User, Movie, character_archetype_match(Archetype), 3) :-
    preference(User, character_archetype, Archetype),
    character_archetype(Movie, Archetype).


% ============================================================
% RANGE BANDS
% ============================================================
%
% Tolerances live here so the close and far rules cannot drift
% apart. runtime is measured in minutes, year in calendar years.

runtime_tolerance(20).
year_tolerance(5).

inside_range(Value, Min, Max) :-
    Min =< Max,
    Value >= Min,
    Value =< Max.

close_to_range(Value, Min, Max, Tolerance) :-
    Min =< Max,
    Tolerance >= 0,
    (
        Value < Min,
        Difference is Min - Value,
        Difference =< Tolerance
    ;
        Value > Max,
        Difference is Value - Max,
        Difference =< Tolerance
    ).

far_from_range(Value, Min, Max, Tolerance) :-
    Min =< Max,
    Tolerance >= 0,
    Lower is Min - Tolerance,
    Upper is Max + Tolerance,
    (
        Value < Lower
    ;
        Value > Upper
    ).


% ============================================================
% LEVEL RELATIONSHIPS
% ============================================================
%
% Pairs that are not listed are neutral. medium does not match
% or mismatch low or high.

opposite_level(low, high).
opposite_level(high, low).


% ============================================================
% PACE RELATIONSHIPS
% ============================================================

opposite_pace(slow, fast).
opposite_pace(fast, slow).


% ============================================================
% POPULARITY RELATIONSHIPS
% ============================================================

opposite_popularity(mainstream, niche).
opposite_popularity(niche, mainstream).


% ============================================================
% QUERY HELPERS
% ============================================================

compatibility_reasons(User, Movie, Results) :-
    findall(
        Reason-Points,
        compatibility(User, Movie, Reason, Points),
        Results
    ).

positive_compatibility(User, Movie, Reason, Points) :-
    compatibility(User, Movie, Reason, Points),
    Points > 0.

negative_compatibility(User, Movie, Reason, Points) :-
    compatibility(User, Movie, Reason, Points),
    Points < 0.

positive_compatibility_reasons(User, Movie, Results) :-
    findall(
        Reason-Points,
        positive_compatibility(User, Movie, Reason, Points),
        Results
    ).

negative_compatibility_reasons(User, Movie, Results) :-
    findall(
        Reason-Points,
        negative_compatibility(User, Movie, Reason, Points),
        Results
    ).

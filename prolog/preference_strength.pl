% ============================================================
% preference_strength.pl
% Movie Recommendation Expert System
% Preference Strength Calculation Layer
% ============================================================
%
% PURPOSE
% -------
% Apply user-specific preference strength to compatibility evidence.
%
% Strength scale:
%
%   -2 = strong dislike
%   -1 = dislike
%    0 = neutral
%   +1 = like
%   +2 = strong like
%
% Expected user facts:
%
%   preference(User, Category, Value).
%   preference_strength(User, Category, Value, Strength).
%
% Strength only scales an existing preference/3. A strength fact
% with no matching preference does not affect the score.
%
% Examples:
%
%   preference_strength(user1, genre, horror, 2).
%   preference_strength(user1, subgenre, slasher, 2).
%   preference_strength(user1, gore, high, 1).
%   preference_strength(user1, humor, high, -1).
%   preference_strength(user1, runtime, range(90, 120), 2).
%
% Range categories use the same term as preference/3: range(Min, Max).
%
% If no strength fact matches a preference, +1 is used.
% A strength fact outside -2..2 is an error, not a default.
%
% Ceiling:
%
%   Strength >= 0
%       Base weight times strength. This is the best match.
%   Strength < 0, exclusive or range category
%       Base weight times abs(strength). A mismatch or a far
%       range can flip into that many positive points.
%   Strength < 0, presence-only category
%       0. Avoiding the value scores nothing, so it does not
%       enlarge the ceiling.
%
% ============================================================

:- multifile preference_strength/4.
:- dynamic preference_strength/4.

default_preference_strength(1).

valid_preference_strength(-2).
valid_preference_strength(-1).
valid_preference_strength(0).
valid_preference_strength(1).
valid_preference_strength(2).

resolved_preference_strength(User, Category, Value, Strength) :-
    preference_strength(User, Category, Value, Strength),
    !,
    (   valid_preference_strength(Strength)
    ->  true
    ;   throw(error(
            domain_error(preference_strength, Strength),
            preference_strength
        ))
    ).

resolved_preference_strength(_, _, _, Strength) :-
    default_preference_strength(Strength).


% ============================================================
% MAP COMPATIBILITY REASONS TO USER PREFERENCES
% ============================================================

reason_preference(genre_match(Value), genre, Value).
reason_preference(subgenre_match(Value), subgenre, Value).

reason_preference(runtime_match(_, Min, Max), runtime, range(Min, Max)).
reason_preference(runtime_close(_, Min, Max), runtime, range(Min, Max)).
reason_preference(runtime_mismatch(_, Min, Max), runtime, range(Min, Max)).

reason_preference(year_match(_, Min, Max), year, range(Min, Max)).
reason_preference(year_close(_, Min, Max), year, range(Min, Max)).
reason_preference(year_mismatch(_, Min, Max), year, range(Min, Max)).

reason_preference(decade_match(Value), decade, Value).
reason_preference(age_rating_match(Value), age_rating, Value).
reason_preference(language_match(Value), language, Value).
reason_preference(actor_match(Value), actor, Value).
reason_preference(director_match(Value), director, Value).
reason_preference(producer_match(Value), producer, Value).
reason_preference(character_match(Value), character, Value).
reason_preference(theme_match(Value), theme, Value).

reason_preference(humor_match(Value), humor, Value).
reason_preference(humor_mismatch(Preferred, _), humor, Preferred).

reason_preference(realism_match(Value), realism, Value).
reason_preference(realism_mismatch(Preferred, _), realism, Preferred).

reason_preference(pace_match(Value), pace, Value).
reason_preference(pace_mismatch(Preferred, _), pace, Preferred).

reason_preference(gore_match(Value), gore, Value).
reason_preference(gore_mismatch(Preferred, _), gore, Preferred).

reason_preference(violence_match(Value), violence, Value).
reason_preference(violence_mismatch(Preferred, _), violence, Preferred).

reason_preference(popularity_match(Value), popularity, Value).
reason_preference(popularity_mismatch(Preferred, _), popularity, Preferred).

reason_preference(trending_match(Value), trending, Value).

reason_preference(
    character_archetype_match(Value),
    character_archetype,
    Value
).

unmapped_compatibility_reasons(Reasons) :-
    % clause/2 fails when compatibility/4 is not loaded, which would
    % look like full coverage. Require the predicate first.
    (   current_predicate(compatibility/4)
    ->  true
    ;   throw(error(
            existence_error(procedure, compatibility/4),
            preference_strength
        ))
    ),
    findall(
        Reason,
        (
            clause(compatibility(_, _, Reason, _), _),
            \+ reason_preference(Reason, _, _)
        ),
        Reasons
    ).


% ============================================================
% STRENGTH MULTIPLIER
% ============================================================

strength_multiplier(Strength, Strength) :-
    valid_preference_strength(Strength).


% ============================================================
% WEIGHT ONE COMPATIBILITY CONTRIBUTION
% ============================================================

weighted_contribution(
    User,
    Reason,
    BasePoints,
    Strength,
    WeightedPoints
) :-
    require_reason_mapping(Reason, Category, Value),
    resolved_preference_strength(User, Category, Value, Strength),
    strength_multiplier(Strength, Multiplier),
    WeightedPoints is BasePoints * Multiplier.

require_reason_mapping(Reason, Category, Value) :-
    reason_preference(Reason, Category, Value),
    !.

require_reason_mapping(Reason, _, _) :-
    throw(error(
        existence_error(reason_preference, Reason),
        preference_strength
    )).


% ============================================================
% COLLECT WEIGHTED CONTRIBUTIONS
% ============================================================

weighted_compatibility_contributions(User, Movie, Contributions) :-
    eligible_movie(User, Movie),
    setof(
        weighted(Reason, BasePoints, Strength, WeightedPoints),
        (
            compatibility(User, Movie, Reason, BasePoints),
            weighted_contribution(
                User,
                Reason,
                BasePoints,
                Strength,
                WeightedPoints
            )
        ),
        Contributions
    ),
    !.

weighted_compatibility_contributions(User, Movie, []) :-
    eligible_movie(User, Movie),
    !.


% ============================================================
% WEIGHTED POSITIVE / NEGATIVE / RAW SCORES
% ============================================================

weighted_positive_score(User, Movie, Score) :-
    weighted_compatibility_sums(User, Movie, Score, _, _).

weighted_negative_score(User, Movie, Score) :-
    weighted_compatibility_sums(User, Movie, _, Score, _).

weighted_raw_score(User, Movie, Score) :-
    weighted_compatibility_sums(User, Movie, _, _, Score).

weighted_compatibility_sums(User, Movie, Positive, Negative, Raw) :-
    weighted_compatibility_contributions(User, Movie, Contributions),
    sum_weighted_contributions(
        Contributions,
        0,
        0,
        Positive,
        Negative
    ),
    Raw is Positive + Negative.

sum_weighted_contributions([], Positive, Negative, Positive, Negative).

sum_weighted_contributions(
    [weighted(_, _, _, Points)|Rest],
    Positive0,
    Negative0,
    Positive,
    Negative
) :-
    accumulate_weighted_point(
        Points,
        Positive0,
        Negative0,
        Positive1,
        Negative1
    ),
    sum_weighted_contributions(
        Rest,
        Positive1,
        Negative1,
        Positive,
        Negative
    ).

accumulate_weighted_point(
    Points,
    Positive0,
    Negative,
    Positive,
    Negative
) :-
    Points > 0,
    !,
    Positive is Positive0 + Points.

accumulate_weighted_point(
    Points,
    Positive,
    Negative0,
    Positive,
    Negative
) :-
    Points < 0,
    !,
    Negative is Negative0 + Points.

accumulate_weighted_point(
    _,
    Positive,
    Negative,
    Positive,
    Negative
).


% ============================================================
% WEIGHTED COMPARABLE CEILING
% ============================================================
%
% Exclusive and range categories can turn a dislike into
% positive points, because a mismatch or a far range awards
% -Weight. Presence-only categories cannot.
%

invertible_category(humor).
invertible_category(realism).
invertible_category(pace).
invertible_category(gore).
invertible_category(violence).
invertible_category(popularity).
invertible_category(runtime).
invertible_category(year).

weighted_preference_maximum(_, BaseWeight, Strength, Maximum) :-
    Strength >= 0,
    !,
    Maximum is BaseWeight * Strength.

weighted_preference_maximum(Category, BaseWeight, Strength, Maximum) :-
    invertible_category(Category),
    !,
    Maximum is BaseWeight * abs(Strength).

weighted_preference_maximum(_, _, _, 0).

weighted_comparable_ceiling(User, Movie, Ceiling) :-
    findall(
        WeightedMaximum,
        (
            preference(User, Category, Value),
            movie_fact_available(Category, Movie),
            scored_preference(Category, Value, BaseWeight),
            resolved_preference_strength(
                User,
                Category,
                Value,
                Strength
            ),
            weighted_preference_maximum(
                Category,
                BaseWeight,
                Strength,
                WeightedMaximum
            )
        ),
        Weights
    ),
    sum_list(Weights, Ceiling).

scoring_scale(_, Ceiling, Ceiling) :-
    Ceiling > 0,
    !.

scoring_scale(Raw, 0, 1) :-
    Raw =:= 0,
    !.

scoring_scale(Raw, 0, Scale) :-
    Raw < 0,
    !,
    Scale is abs(Raw).

scoring_scale(Raw, 0, _) :-
    Raw > 0,
    throw(error(
        domain_error(non_positive_raw_with_zero_ceiling, Raw),
        preference_strength
    )).


% ============================================================
% NORMALIZED WEIGHTED COMPATIBILITY
% ============================================================

weighted_compatibility_score(User, Movie, Score) :-
    eligible_movie(User, Movie),
    weighted_raw_score(User, Movie, RawScore),
    weighted_comparable_ceiling(User, Movie, Ceiling),
    scoring_scale(RawScore, Ceiling, Scale),
    normalize_compatibility(RawScore, Scale, Score).


% ============================================================
% WEIGHTED SCORE SUMMARY
% ============================================================

weighted_score_breakdown(User, Movie, Breakdown) :-
    eligible_movie(User, Movie),
    weighted_positive_score(User, Movie, Positive),
    weighted_negative_score(User, Movie, Negative),
    weighted_raw_score(User, Movie, Raw),
    weighted_comparable_ceiling(User, Movie, Ceiling),
    scoring_scale(Raw, Ceiling, Scale),
    normalize_compatibility(Raw, Scale, Score),
    weighted_compatibility_contributions(User, Movie, Contributions),
    Breakdown = weighted_breakdown(
        raw(Raw),
        maximum(Ceiling),
        score(Score),
        positive(Positive),
        negative(Negative),
        contributions(Contributions)
    ).


% ============================================================
% RANKING
% ============================================================

weighted_movie_score(User, Movie, Score) :-
    movie(Movie),
    weighted_compatibility_score(User, Movie, Score).

weighted_ranked_movies(User, RankedMovies) :-
    findall(
        (NegPercentage-NegRaw)-(Score-Movie),
        (
            movie(Movie),
            weighted_raw_score(User, Movie, RawScore),
            weighted_comparable_ceiling(User, Movie, Ceiling),
            scoring_scale(RawScore, Ceiling, Scale),
            unclamped_percentage(RawScore, Scale, Percentage),
            normalize_compatibility(RawScore, Scale, Score),
            NegPercentage is -Percentage,
            NegRaw is -RawScore
        ),
        KeyedMovies
    ),
    keysort(KeyedMovies, Sorted),
    unkey_weighted_ranked_movies(Sorted, RankedMovies).

unkey_weighted_ranked_movies([], []).

unkey_weighted_ranked_movies(
    [_-Pair|Rest],
    [Pair|Ranked]
) :-
    unkey_weighted_ranked_movies(Rest, Ranked).

weighted_top_movies(User, N, TopMovies) :-
    integer(N),
    N >= 0,
    weighted_ranked_movies(User, RankedMovies),
    take_first(N, RankedMovies, TopMovies).

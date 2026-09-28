% ============================================================
% users.pl
% Movie Recommendation Expert System
% User Knowledge Base
% ============================================================
%
% PURPOSE
% -------
% This file stores explicit user preference facts only.
%
% Generic representation:
%
%   preference(User, Category, Value).
%
% Users are inferred automatically from existing preferences:
%
%   user(User) :-
%       preference(User, _, _).
%
% This file DOES NOT implement:
% - Preference strength
% - Hard/soft constraint evaluation
% - Recommendation scoring
% - User inference beyond user existence
% - Movie inference
%
% Those concerns should be implemented in separate features.
%
% ============================================================


% ============================================================
% USER 1
% Horror / slasher-oriented example profile
% ============================================================

preference(user1, genre, horror).
preference(user1, genre, thriller).

preference(user1, subgenre, slasher).
preference(user1, subgenre, psychological_horror).

preference(user1, runtime, range(80, 120)).

preference(user1, year, range(1990, 2025)).
preference(user1, decade, nineties).
preference(user1, decade, two_thousands).

preference(user1, age_rating, r).

preference(user1, language, english).

preference(user1, actor, neve_campbell).
preference(user1, actor, toni_collette).

preference(user1, director, wes_craven).
preference(user1, director, ari_aster).

preference(user1, producer, jason_blum).

preference(user1, character, ghostface).
preference(user1, character, michael_myers).

preference(user1, theme, survival).
preference(user1, theme, revenge).
preference(user1, theme, mystery).

preference(user1, humor, medium).

preference(user1, realism, medium).

preference(user1, pace, fast).

preference(user1, gore, high).

preference(user1, violence, high).

preference(user1, popularity, mainstream).

preference(user1, trending, yes).

preference(user1, character_archetype, final_girl).
preference(user1, character_archetype, intelligent_villain).


% ============================================================
% USER 2
% Science-fiction / fantasy-oriented example profile
% ============================================================

preference(user2, genre, science_fiction).
preference(user2, genre, fantasy).
preference(user2, genre, adventure).

preference(user2, subgenre, space_opera).
preference(user2, subgenre, dystopian_science_fiction).

preference(user2, runtime, range(100, 180)).

preference(user2, year, range(1980, 2025)).
preference(user2, decade, nineties).
preference(user2, decade, twenty_tens).

preference(user2, age_rating, pg13).

preference(user2, language, english).
preference(user2, language, japanese).

preference(user2, actor, keanu_reeves).
preference(user2, actor, ryan_gosling).

preference(user2, director, christopher_nolan).
preference(user2, director, denis_villeneuve).

preference(user2, producer, emma_thomas).

preference(user2, character, neo).
preference(user2, character, k).

preference(user2, theme, artificial_intelligence).
preference(user2, theme, identity).
preference(user2, theme, space).
preference(user2, theme, time).

preference(user2, humor, low).

preference(user2, realism, low).

preference(user2, pace, medium).

preference(user2, gore, low).

preference(user2, violence, medium).

preference(user2, popularity, niche).

preference(user2, trending, neutral).

preference(user2, character_archetype, chosen_one).
preference(user2, character_archetype, antihero).


% ============================================================
% BASIC HELPER QUERIES
% ============================================================

% A user exists if at least one preference exists for that user.
user(User) :-
    preference(User, _, _).

% Check whether a user exists.
user_exists(User) :-
    user(User).

% Check whether a specific preference exists.
has_preference(User, Category, Value) :-
    preference(User, Category, Value).

% Return all values for one preference category.
preferences_by_category(User, Category, Values) :-
    findall(
        Value,
        preference(User, Category, Value),
        Values
    ).

% Return all preferred genres.
preferred_genres(User, Genres) :-
    preferences_by_category(User, genre, Genres).

% Return all preferred subgenres.
preferred_subgenres(User, Subgenres) :-
    preferences_by_category(User, subgenre, Subgenres).

% Return preferred runtime range.
preferred_runtime(User, Min, Max) :-
    preference(User, runtime, range(Min, Max)).

% Return preferred year range.
preferred_year_range(User, Min, Max) :-
    preference(User, year, range(Min, Max)).

% Return all preferred decades.
preferred_decades(User, Decades) :-
    preferences_by_category(User, decade, Decades).

% Return all preferred languages.
preferred_languages(User, Languages) :-
    preferences_by_category(User, language, Languages).

% Return all liked actors.
liked_actors(User, Actors) :-
    preferences_by_category(User, actor, Actors).

% Return all liked directors.
liked_directors(User, Directors) :-
    preferences_by_category(User, director, Directors).

% Return all liked producers.
liked_producers(User, Producers) :-
    preferences_by_category(User, producer, Producers).

% Return all liked characters.
liked_characters(User, Characters) :-
    preferences_by_category(User, character, Characters).

% Return all preferred themes.
preferred_themes(User, Themes) :-
    preferences_by_category(User, theme, Themes).

% Return all preferred character archetypes.
preferred_character_archetypes(User, Archetypes) :-
    preferences_by_category(User, character_archetype, Archetypes).

% Return every explicit preference for a user.
all_preferences(User, Preferences) :-
    findall(
        Category-Value,
        preference(User, Category, Value),
        Preferences
    ).

% Compact summary of the main explicit preferences.
user_profile_summary(
    User,
    Genres,
    Subgenres,
    RuntimeMin,
    RuntimeMax,
    Languages,
    Actors,
    Directors,
    Characters,
    Themes
) :-
    user(User),
    preferred_genres(User, Genres),
    preferred_subgenres(User, Subgenres),
    preferred_runtime(User, RuntimeMin, RuntimeMax),
    preferred_languages(User, Languages),
    liked_actors(User, Actors),
    liked_directors(User, Directors),
    liked_characters(User, Characters),
    preferred_themes(User, Themes).

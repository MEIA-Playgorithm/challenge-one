% ============================================================
% movie_inference.pl
% Movie Recommendation Expert System
% Movie Feature Inference Layer
% ============================================================
%
% PURPOSE
% -------
% Infer semantic movie attributes from raw facts in movies.pl.
%
% Expected raw predicates from movies.pl:
%   release_year/2
%   genre/2
%   keyword/2
%   popularity/2
%   vote_count/2
%   character/2
%
% This file does NOT implement:
% - User compatibility
% - Recommendation scoring
% - Hard/soft constraints
% - Preference strength
% - Confidence
% - Explanations
%
% ============================================================


% ============================================================
% 1. DECADE
% ============================================================

decade(Movie, seventies) :-
    release_year(Movie, Year),
    Year >= 1970,
    Year < 1980.

decade(Movie, eighties) :-
    release_year(Movie, Year),
    Year >= 1980,
    Year < 1990.

decade(Movie, nineties) :-
    release_year(Movie, Year),
    Year >= 1990,
    Year < 2000.

decade(Movie, two_thousands) :-
    release_year(Movie, Year),
    Year >= 2000,
    Year < 2010.

decade(Movie, twenty_tens) :-
    release_year(Movie, Year),
    Year >= 2010,
    Year < 2020.

decade(Movie, twenty_twenties) :-
    release_year(Movie, Year),
    Year >= 2020,
    Year < 2030.


% ============================================================
% 2. SUBGENRE
% ============================================================

subgenre(Movie, slasher) :-
    genre(Movie, horror),
    keyword(Movie, masked_killer),
    keyword(Movie, final_girl).

subgenre(Movie, supernatural_horror) :-
    genre(Movie, horror),
    (
        keyword(Movie, ghost)
    ;   keyword(Movie, demon)
    ;   keyword(Movie, possession)
    ;   keyword(Movie, paranormal)
    ;   keyword(Movie, haunted_house)
    ).

subgenre(Movie, psychological_horror) :-
    genre(Movie, horror),
    (
        keyword(Movie, trauma)
    ;   keyword(Movie, grief)
    ;   keyword(Movie, psychological)
    ;   keyword(Movie, mind_control)
    ).

subgenre(Movie, teen_comedy) :-
    genre(Movie, comedy),
    (
        keyword(Movie, teen_comedy)
    ;   keyword(Movie, high_school)
    ;   keyword(Movie, teenager)
    ).

subgenre(Movie, dark_comedy) :-
    genre(Movie, comedy),
    keyword(Movie, dark_comedy).

subgenre(Movie, romantic_comedy) :-
    genre(Movie, romance),
    genre(Movie, comedy).

subgenre(Movie, dystopian_science_fiction) :-
    genre(Movie, science_fiction),
    keyword(Movie, dystopia).

subgenre(Movie, artificial_intelligence_scifi) :-
    genre(Movie, science_fiction),
    keyword(Movie, artificial_intelligence).

subgenre(Movie, time_travel_scifi) :-
    genre(Movie, science_fiction),
    keyword(Movie, time_travel).

subgenre(Movie, space_scifi) :-
    genre(Movie, science_fiction),
    (
        keyword(Movie, space)
    ;   keyword(Movie, space_travel)
    ;   keyword(Movie, black_hole)
    ).

subgenre(Movie, war_drama) :-
    genre(Movie, drama),
    genre(Movie, war).

subgenre(Movie, historical_biography) :-
    genre(Movie, historical),
    genre(Movie, biography).


% ============================================================
% 3. THEMES
% ============================================================

theme(Movie, survival) :-
    keyword(Movie, survival).

theme(Movie, revenge) :-
    keyword(Movie, revenge).

theme(Movie, friendship) :-
    keyword(Movie, friendship).

theme(Movie, family) :-
    (
        keyword(Movie, family)
    ;   keyword(Movie, father_daughter)
    ;   keyword(Movie, relationship)
    ).

theme(Movie, identity) :-
    keyword(Movie, identity).

theme(Movie, technology) :-
    (
        keyword(Movie, technology)
    ;   keyword(Movie, artificial_intelligence)
    ;   keyword(Movie, simulation)
    ;   keyword(Movie, virtual_reality)
    ).

theme(Movie, social_issues) :-
    (
        keyword(Movie, social_commentary)
    ;   keyword(Movie, social_issue)
    ;   keyword(Movie, social_inequality)
    ;   keyword(Movie, civil_rights)
    ).

theme(Movie, war) :-
    (
        keyword(Movie, war)
    ;   keyword(Movie, world_war_i)
    ;   keyword(Movie, world_war_ii)
    ).

theme(Movie, romance) :-
    (
        keyword(Movie, romance)
    ;   genre(Movie, romance)
    ).

theme(Movie, personal_growth) :-
    (
        keyword(Movie, self_improvement)
    ;   keyword(Movie, coming_of_age)
    ;   keyword(Movie, personal_growth)
    ).

theme(Movie, ambition) :-
    (
        keyword(Movie, ambition)
    ;   keyword(Movie, dreams)
    ;   keyword(Movie, career)
    ).

theme(Movie, justice) :-
    (
        keyword(Movie, justice_system)
    ;   keyword(Movie, crime)
    ;   keyword(Movie, persecution)
    ).

theme(Movie, morality) :-
    (
        keyword(Movie, moral_dilemma)
    ;   keyword(Movie, ethics)
    ;   keyword(Movie, philosophy)
    ).


% ============================================================
% 4. SUPERNATURAL CONTENT
% ============================================================

supernatural_evidence(Movie, 3) :-
    (
        keyword(Movie, demon)
    ;   keyword(Movie, possession)
    ;   keyword(Movie, ghost)
    ;   keyword(Movie, supernatural)
    ;   keyword(Movie, paranormal)
    ).

supernatural_evidence(Movie, 2) :-
    (
        keyword(Movie, magic)
    ;   keyword(Movie, spirit_world)
    ;   keyword(Movie, witch)
    ;   keyword(Movie, curse)
    ;   keyword(Movie, werewolf)
    ).

supernatural_evidence(Movie, 1) :-
    genre(Movie, fantasy).

supernatural_score(Movie, Score) :-
    findall(Value, supernatural_evidence(Movie, Value), Values),
    sum_list(Values, Score).

supernatural_content(Movie, high) :-
    supernatural_score(Movie, Score),
    Score >= 5.

supernatural_content(Movie, medium) :-
    supernatural_score(Movie, Score),
    Score >= 2,
    Score < 5.

supernatural_content(Movie, low) :-
    supernatural_score(Movie, Score),
    Score > 0,
    Score < 2.


% ============================================================
% 5. HUMOR LEVEL
% ============================================================

humor_evidence(Movie, 3) :-
    genre(Movie, comedy).

humor_evidence(Movie, 3) :-
    (
        keyword(Movie, parody)
    ;   keyword(Movie, satire)
    ;   keyword(Movie, dark_comedy)
    ;   keyword(Movie, adult_humor)
    ;   keyword(Movie, awkward_humor)
    ).

humor_evidence(Movie, 1) :-
    keyword(Movie, meta_horror).

humor_score(Movie, Score) :-
    findall(Value, humor_evidence(Movie, Value), Values),
    sum_list(Values, Score).

humor_level(Movie, high) :-
    humor_score(Movie, Score),
    Score >= 5.

humor_level(Movie, medium) :-
    humor_score(Movie, Score),
    Score >= 3,
    Score < 5.

humor_level(Movie, low) :-
    humor_score(Movie, Score),
    Score > 0,
    Score < 3.


% ============================================================
% 6. REALISM
% ============================================================

realism(Movie, high) :-
    genre(Movie, documentary).

realism(Movie, high) :-
    genre(Movie, biography).

realism(Movie, medium) :-
    genre(Movie, historical),
    \+ genre(Movie, fantasy).

realism(Movie, low) :-
    genre(Movie, fantasy).

realism(Movie, low) :-
    genre(Movie, science_fiction),
    (
        keyword(Movie, artificial_intelligence)
    ;   keyword(Movie, time_travel)
    ;   keyword(Movie, virtual_reality)
    ;   keyword(Movie, simulation)
    ;   keyword(Movie, aliens)
    ).


% ============================================================
% 7. MAINSTREAM VS NICHE
% ============================================================
%
% This requires numeric popularity/2 and vote_count/2 facts.
% It will return no result while those facts are 'unknown'.

market_position(Movie, mainstream) :-
    popularity(Movie, Popularity),
    vote_count(Movie, Votes),
    number(Popularity),
    number(Votes),
    Popularity >= 70,
    Votes >= 5000.

market_position(Movie, niche) :-
    popularity(Movie, Popularity),
    vote_count(Movie, Votes),
    number(Popularity),
    number(Votes),
    Popularity < 40,
    Votes < 5000.

market_position(Movie, balanced) :-
    popularity(Movie, Popularity),
    vote_count(Movie, Votes),
    number(Popularity),
    number(Votes),
    \+ market_position(Movie, mainstream),
    \+ market_position(Movie, niche).


% ============================================================
% 8. PACE
% ============================================================

pace_evidence(Movie, fast, 3) :-
    genre(Movie, action).

pace_evidence(Movie, fast, 2) :-
    (
        keyword(Movie, chase)
    ;   keyword(Movie, car_chase)
    ;   keyword(Movie, gunfight)
    ;   keyword(Movie, sword_fight)
    ;   keyword(Movie, high_action)
    ).

pace_evidence(Movie, slow, 3) :-
    (
        keyword(Movie, conversation)
    ;   keyword(Movie, grief)
    ;   keyword(Movie, philosophy)
    ;   keyword(Movie, loneliness)
    ).

pace_evidence(Movie, slow, 2) :-
    genre(Movie, drama),
    \+ genre(Movie, action).

pace_score(Movie, fast, Score) :-
    findall(Value, pace_evidence(Movie, fast, Value), Values),
    sum_list(Values, Score).

pace_score(Movie, slow, Score) :-
    findall(Value, pace_evidence(Movie, slow, Value), Values),
    sum_list(Values, Score).

pace(Movie, fast) :-
    pace_score(Movie, fast, Fast),
    pace_score(Movie, slow, Slow),
    Fast > Slow,
    Fast >= 3.

pace(Movie, slow) :-
    pace_score(Movie, fast, Fast),
    pace_score(Movie, slow, Slow),
    Slow > Fast,
    Slow >= 3.

pace(Movie, medium) :-
    pace_score(Movie, fast, Fast),
    pace_score(Movie, slow, Slow),
    Fast =:= Slow,
    Fast > 0.


% ============================================================
% 9. COMPLEXITY
% ============================================================

complexity_evidence(Movie, 3) :-
    (
        keyword(Movie, nonlinear_narrative)
    ;   keyword(Movie, time_travel)
    ;   keyword(Movie, simulation)
    ;   keyword(Movie, philosophy)
    ).

complexity_evidence(Movie, 2) :-
    (
        keyword(Movie, artificial_intelligence)
    ;   keyword(Movie, moral_dilemma)
    ;   keyword(Movie, identity)
    ;   keyword(Movie, memory)
    ).

complexity_evidence(Movie, 1) :-
    (
        genre(Movie, mystery)
    ;   keyword(Movie, conspiracy)
    ).

complexity_score(Movie, Score) :-
    findall(Value, complexity_evidence(Movie, Value), Values),
    sum_list(Values, Score).

complexity(Movie, high) :-
    complexity_score(Movie, Score),
    Score >= 5.

complexity(Movie, medium) :-
    complexity_score(Movie, Score),
    Score >= 2,
    Score < 5.

complexity(Movie, low) :-
    complexity_score(Movie, Score),
    Score > 0,
    Score < 2.


% ============================================================
% 10. PSYCHOLOGICAL INTENSITY
% ============================================================

psychological_evidence(Movie, 3) :-
    (
        keyword(Movie, trauma)
    ;   keyword(Movie, mind_control)
    ;   keyword(Movie, manipulation)
    ).

psychological_evidence(Movie, 2) :-
    (
        keyword(Movie, grief)
    ;   keyword(Movie, identity)
    ;   keyword(Movie, paranoia)
    ;   keyword(Movie, isolation)
    ).

psychological_evidence(Movie, 1) :-
    genre(Movie, mystery).

psychological_score(Movie, Score) :-
    findall(Value, psychological_evidence(Movie, Value), Values),
    sum_list(Values, Score).

psychological_intensity(Movie, high) :-
    psychological_score(Movie, Score),
    Score >= 5.

psychological_intensity(Movie, medium) :-
    psychological_score(Movie, Score),
    Score >= 2,
    Score < 5.

psychological_intensity(Movie, low) :-
    psychological_score(Movie, Score),
    Score > 0,
    Score < 2.


% ============================================================
% 11. EMOTIONAL TONE
% ============================================================

emotional_tone(Movie, dark) :-
    (
        keyword(Movie, grief)
    ;   keyword(Movie, trauma)
    ;   keyword(Movie, murder)
    ;   keyword(Movie, persecution)
    ;   keyword(Movie, dystopia)
    ).

emotional_tone(Movie, uplifting) :-
    (
        keyword(Movie, friendship)
    ;   keyword(Movie, achievement)
    ;   keyword(Movie, self_improvement)
    ;   keyword(Movie, dreams)
    ).

emotional_tone(Movie, romantic) :-
    genre(Movie, romance).

emotional_tone(Movie, tense) :-
    (
        genre(Movie, thriller)
    ;   keyword(Movie, survival)
    ;   keyword(Movie, hostage)
    ).

emotional_tone(Movie, adventurous) :-
    genre(Movie, adventure).

emotional_tone(Movie, humorous) :-
    genre(Movie, comedy).


% ============================================================
% 12. VIOLENCE LEVEL
% ============================================================

violence_evidence(Movie, 3) :-
    (
        keyword(Movie, gunfight)
    ;   keyword(Movie, war)
    ;   keyword(Movie, serial_killer)
    ;   keyword(Movie, murder)
    ;   keyword(Movie, sword_fight)
    ).

violence_evidence(Movie, 2) :-
    (
        keyword(Movie, revenge)
    ;   keyword(Movie, assassin)
    ;   keyword(Movie, terrorist)
    ;   keyword(Movie, stalking)
    ).

violence_evidence(Movie, 1) :-
    genre(Movie, action).

violence_score(Movie, Score) :-
    findall(Value, violence_evidence(Movie, Value), Values),
    sum_list(Values, Score).

violence_level(Movie, high) :-
    violence_score(Movie, Score),
    Score >= 5.

violence_level(Movie, medium) :-
    violence_score(Movie, Score),
    Score >= 2,
    Score < 5.

violence_level(Movie, low) :-
    violence_score(Movie, Score),
    Score > 0,
    Score < 2.


% ============================================================
% 13. GORE LEVEL
% ============================================================

gore_evidence(Movie, 3) :-
    (
        keyword(Movie, gore)
    ;   keyword(Movie, mutilation)
    ;   keyword(Movie, dismemberment)
    ).

gore_evidence(Movie, 2) :-
    (
        keyword(Movie, blood)
    ;   keyword(Movie, stabbing)
    ).

gore_evidence(Movie, 1) :-
    (
        keyword(Movie, murder)
    ;   keyword(Movie, serial_killer)
    ).

gore_score(Movie, Score) :-
    findall(Value, gore_evidence(Movie, Value), Values),
    sum_list(Values, Score).

gore_level(Movie, high) :-
    gore_score(Movie, Score),
    Score >= 5.

gore_level(Movie, medium) :-
    gore_score(Movie, Score),
    Score >= 2,
    Score < 5.

gore_level(Movie, low) :-
    gore_score(Movie, Score),
    Score > 0,
    Score < 2.


% ============================================================
% 14. CHARACTER ARCHETYPES
% ============================================================

character_archetype(Movie, chosen_one) :-
    keyword(Movie, chosen_one).

character_archetype(Movie, vigilante) :-
    keyword(Movie, vigilante).

character_archetype(Movie, antihero) :-
    keyword(Movie, antihero).

character_archetype(Movie, final_girl) :-
    keyword(Movie, final_girl).

character_archetype(Movie, detective) :-
    keyword(Movie, detective).

character_archetype(Movie, intelligent_villain) :-
    keyword(Movie, mastermind_villain).

character_archetype(Movie, survivor) :-
    keyword(Movie, survival).

character_archetype(Movie, mentor) :-
    (
        character(Movie, gandalf)
    ;   character(Movie, sam_loomis)
    ;   character(Movie, professor_brand)
    ).


% ============================================================
% GENERIC INFERENCE HELPERS
% ============================================================

inferred_subgenres(Movie, Subgenres) :-
    setof(Subgenre, subgenre(Movie, Subgenre), Subgenres), !.
inferred_subgenres(_, []).

inferred_themes(Movie, Themes) :-
    setof(Theme, theme(Movie, Theme), Themes), !.
inferred_themes(_, []).

inferred_emotional_tones(Movie, Tones) :-
    setof(Tone, emotional_tone(Movie, Tone), Tones), !.
inferred_emotional_tones(_, []).

inferred_character_archetypes(Movie, Archetypes) :-
    setof(Archetype, character_archetype(Movie, Archetype), Archetypes), !.
inferred_character_archetypes(_, []).

% Generic helper for optional single-valued inferences.
optional_value(Goal, Value, Default) :-
    ( call(Goal) -> true ; Value = Default ).

movie_inference_summary(
    Movie,
    Decade,
    Subgenres,
    Themes,
    Supernatural,
    Humor,
    Realism,
    Pace,
    Complexity,
    PsychologicalIntensity,
    EmotionalTones,
    Violence,
    Gore,
    Archetypes
) :-
    decade(Movie, Decade),
    inferred_subgenres(Movie, Subgenres),
    inferred_themes(Movie, Themes),
    optional_value(supernatural_content(Movie, Supernatural), Supernatural, unknown),
    optional_value(humor_level(Movie, Humor), Humor, unknown),
    optional_value(realism(Movie, Realism), Realism, unknown),
    optional_value(pace(Movie, Pace), Pace, unknown),
    optional_value(complexity(Movie, Complexity), Complexity, unknown),
    optional_value(psychological_intensity(Movie, PsychologicalIntensity), PsychologicalIntensity, unknown),
    inferred_emotional_tones(Movie, EmotionalTones),
    optional_value(violence_level(Movie, Violence), Violence, unknown),
    optional_value(gore_level(Movie, Gore), Gore, unknown),
    inferred_character_archetypes(Movie, Archetypes).

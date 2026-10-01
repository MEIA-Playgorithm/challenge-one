% Regras de produção para sp_exp1.pl e sp_exp2.pl; conclusões guardadas em facto/2.
:- if(\+ current_predicate(arranca_motor/0)).
:- ensure_loaded(sp_exp1).
:- endif.

:- multifile regra/1.

regra 1
    se [movie(Id, _)
        e recolhe(G, genre(Id, G), Genres)
        e teste(movie_level(pace, Genres, Value))]
    entao [cria_facto(pace(Id, Value))].

regra 2
    se [movie(Id, _)
        e recolhe(G, genre(Id, G), Genres)
        e teste(movie_level(complexity, Genres, Value))]
    entao [cria_facto(complexity(Id, Value))].

regra 3
    se [movie(Id, _)
        e recolhe(G, genre(Id, G), Genres)
        e teste(movie_level(violence, Genres, Value))]
    entao [cria_facto(violence(Id, Value))].

regra 4
    se [movie(Id, _)
        e recolhe(G, genre(Id, G), Genres)
        e teste(movie_level(humor, Genres, Value))]
    entao [cria_facto(humor(Id, Value))].

regra 5
    se [movie(Id, _)
        e recolhe(G, genre(Id, G), Genres)
        e teste(movie_level(psychological_intensity, Genres, Value))]
    entao [cria_facto(psychological_intensity(Id, Value))].

regra 6
    se [movie(Id, _)
        e recolhe(G, genre(Id, G), Genres)
        e teste(movie_tag(emotional_tone, Genres, Value))]
    entao [cria_facto(emotional_tone(Id, Value))].

regra 7
    se [movie(Id, _)
        e recolhe(G, genre(Id, G), Genres)
        e teste(movie_tag(themes, Genres, Value))]
    entao [cria_facto(themes(Id, Value))].

regra 8
    se [movie(Id, _)
        e recolhe(V, vote(Id, V), Votes)
        e teste(movie_audience(Votes, Value))]
    entao [cria_facto(audience(Id, Value))].

regra 9
    se [audience(Id, mainstream)]
    entao [cria_facto(mainstream(Id))].

regra 10
    se [audience(Id, niche)]
    entao [cria_facto(niche(Id))].

regra 11
    se [genre(Id, Genre)
        e teste(known_subgenre(Genre))]
    entao [cria_facto(subgenre(Id, Genre))].

regra 12
    se [avalia(year(Id, >=, 2020))]
    entao [cria_facto(recent_movie(Id))].

regra 13
    se [avalia(year(Id, <, 2000))]
    entao [cria_facto(classic_movie(Id))].

regra 14
    se [avalia(year(Id, >=, 2000)) e avalia(year(Id, <, 2020))]
    entao [cria_facto(modern_movie(Id))].

regra 15
    se [avalia(year(Id, >=, 1990)) e avalia(year(Id, <, 2000))]
    entao [cria_facto(movie_90s(Id))].

regra 16
    se [avalia(year(Id, >=, 2000)) e avalia(year(Id, <, 2010))]
    entao [cria_facto(movie_2000s(Id))].

regra 17
    se [avalia(year(Id, >=, 2010)) e avalia(year(Id, <, 2020))]
    entao [cria_facto(movie_2010s(Id))].

regra 18
    se [avalia(year(Id, >=, 2020)) e avalia(year(Id, <, 2030))]
    entao [cria_facto(movie_2020s(Id))].

regra 19
    se [avalia(vote(Id, >=, 1000000))]
    entao [cria_facto(very_popular(Id))].

regra 20
    se [avalia(vote(Id, >=, 500000)) e avalia(vote(Id, <, 1000000))]
    entao [cria_facto(popular(Id))].

regra 21
    se [avalia(vote(Id, <, 500000))]
    entao [cria_facto(less_popular(Id))].

regra 22
    se [movie(Id, _)
        e recolhe(G, genre(Id, G), Raw)
        e teste(sort(Raw, Genres))
        e teste(Genres \= [])]
    entao [cria_facto(get_genre(Id, Genres))].

regra 23
    se [genre(Id, G1) e genre(Id, G2)
        e teste(G1 \= G2)]
    entao [cria_facto(multi_genre(Id))].

regra 24
    se [genre(A, Value) e genre(B, Value)
        e teste(A \= B)]
    entao [cria_facto(same_genre(A, B))].

regra 25
    se [director(A, Value) e director(B, Value)
        e teste(A \= B)]
    entao [cria_facto(same_director(A, B))].

regra 26
    se [writer(A, Value) e writer(B, Value)
        e teste(A \= B)]
    entao [cria_facto(same_writer(A, B))].

regra 27
    se [star(A, Value) e star(B, Value)
        e teste(A \= B)]
    entao [cria_facto(same_star(A, B))].

regra 28
    se [production_company(A, Value) e production_company(B, Value)
        e teste(A \= B)]
    entao [cria_facto(same_production_company(A, B))].

regra 29
    se [language(A, Value) e language(B, Value)
        e teste(A \= B)]
    entao [cria_facto(same_language(A, B))].

regra 30
    se [country_origin(A, Value) e country_origin(B, Value)
        e teste(A \= B)]
    entao [cria_facto(same_country_origin(A, B))].

regra 31
    se [year(A, Value) e year(B, Value)
        e teste(A \= B)]
    entao [cria_facto(same_era(A, B))].

regra 32
    se [same_genre(A, B) e same_language(A, B)]
    entao [cria_facto(similar_movie(A, B))].

regra 33
    se [movie(A, _) e movie(B, _)
        e teste(A \= B)
        e recolhe(VA, genre(A, VA), GA)
        e recolhe(VB, genre(B, VB), GB)
        e recolhe(DA, director(A, DA), DAs)
        e recolhe(DB, director(B, DB), DBs)
        e recolhe(WA, writer(A, WA), WAs)
        e recolhe(WB, writer(B, WB), WBs)
        e recolhe(CA, country_origin(A, CA), CAs)
        e recolhe(CB, country_origin(B, CB), CBs)
        e recolhe(LA, language(A, LA), LAs)
        e recolhe(LB, language(B, LB), LBs)
        e teste(movie_score([GA-GB-4,DAs-DBs-3,WAs-WBs-2,CAs-CBs-1,LAs-LBs-1], Score))]
    entao [cria_facto(similarity_score(A, B, Score))].

% Última regra do conjunto filmes + utilizadores.
ultima_regra(61).

% Interface de apresentação; não é uma regra que cria conhecimento.
get_genre(Id) :- facto(_, get_genre(Id, Genres)), writeln(Genres).

% Heurísticas sobre os géneros de entrada, por ordem de prioridade.
movie_level(Attribute, Genres, Value) :-
    ( once((level_hint(Attribute, Match, Hints), shares_genre(Genres, Hints)))
    -> Value = Match ; Value = unknown ).

shares_genre(Genres, Hints) :- member(G, Hints), memberchk(G, Genres).

movie_tag(Attribute, Genres, Value) :-
    ( setof(Tag, Hints^(tag_hint(Attribute, Tag, Hints),
                       shares_genre(Genres, Hints)), Tags)
    -> member(Value, Tags) ; Value = unknown ).

mainstream_threshold(500000).
movie_audience(Votes, Value) :-
    ( member(V, Votes), number(V), V >= 0
    -> mainstream_threshold(T), ( V >= T -> Value = mainstream ; Value = niche )
    ; Value = unknown ).

movie_score([], 0).
movie_score([Left-Right-Weight | Rest], Score) :-
    ( once(shares_genre(Left, Right)) -> Points = Weight ; Points = 0 ),
    movie_score(Rest, Remaining), Score is Points + Remaining.

% same_era conserva a semântica original: mesmo ano.
% Os votos aproximam alcance; as classificações de conteúdo são heurísticas.
level_hint(pace, fast, ['Action', 'Adventure', 'Thriller', 'Slapstick']).
level_hint(pace, slow, ['Psychological Drama', 'Period Drama', 'Documentary']).
level_hint(pace, medium, ['Drama', 'Comedy', 'Romance', 'Family']).

level_hint(complexity, high, ['Psychological Thriller', 'Psychological Drama',
    'Mystery', 'Suspense Mystery', 'Cyberpunk', 'Legal Drama']).
level_hint(complexity, medium, ['Crime', 'SciFi', 'Fantasy', 'History', 'Drama']).
level_hint(complexity, low, ['Slapstick', 'Holiday Family', 'Family']).

level_hint(violence, high, ['Splatter Horror', 'Slasher Horror', 'War',
    'OnePerson Army Action']).
level_hint(violence, medium, ['Action', 'Crime', 'Horror', 'Western', 'Wuxia']).
level_hint(violence, low, ['Family', 'Romantic Comedy', 'Holiday Family']).

level_hint(humor, high, ['Comedy', 'Slapstick', 'Parody', 'Buddy Comedy',
    'Dark Comedy', 'Romantic Comedy', 'HighConcept Comedy']).
level_hint(humor, medium, ['Satire', 'Mockumentary']).
level_hint(humor, low, ['Tragedy', 'Psychological Horror', 'War']).

level_hint(psychological_intensity, high, ['Psychological Thriller',
    'Psychological Horror', 'Psychological Drama', 'Tragedy']).
level_hint(psychological_intensity, medium, ['Thriller', 'Suspense Mystery',
    'Horror', 'Mystery', 'Crime', 'War', 'Drama']).
level_hint(psychological_intensity, low, ['Family', 'Slapstick', 'Holiday Family']).

tag_hint(emotional_tone, tense, ['Thriller', 'Suspense Mystery', 'Crime']).
tag_hint(emotional_tone, dark, ['Horror', 'Psychological Horror',
    'Psychological Thriller', 'Dark Comedy', 'Cyberpunk']).
tag_hint(emotional_tone, sad, ['Tragedy']).
tag_hint(emotional_tone, lighthearted, ['Comedy', 'Romantic Comedy',
    'Slapstick', 'Holiday Family']).
tag_hint(emotional_tone, romantic, ['Romance', 'Romantic Comedy', 'Romantic Epic']).
tag_hint(emotional_tone, reflective, ['Psychological Drama', 'Biography', 'Drama']).
tag_hint(emotional_tone, exciting, ['Action', 'Adventure', 'Superhero']).

tag_hint(themes, love, ['Romance', 'Romantic Comedy', 'Romantic Epic']).
tag_hint(themes, family, ['Family', 'Holiday Family']).
tag_hint(themes, growing_up, ['ComingofAge']).
tag_hint(themes, crime, ['Crime', 'True Crime', 'Heist', 'Cop Drama']).
tag_hint(themes, justice, ['Legal Drama', 'Cop Drama', 'Superhero']).
tag_hint(themes, war, ['War']).
tag_hint(themes, history, ['History', 'Period Drama', 'Sword Sandal']).
tag_hint(themes, technology, ['SciFi', 'SciFi Epic', 'Cyberpunk']).
tag_hint(themes, supernatural, ['Supernatural Fantasy', 'Fantasy']).
tag_hint(themes, exploration, ['Adventure', 'Quest', 'Sea Adventure',
    'Jungle Adventure', 'Globetrotting Adventure']).
tag_hint(themes, psychology, ['Psychological Drama', 'Psychological Thriller',
    'Psychological Horror']).
tag_hint(themes, music, ['Music', 'Musical']).
tag_hint(themes, sport, ['Sport']).
tag_hint(themes, life_story, ['Biography']).

known_subgenre(Genre) :-
    member(Genre, ['Action Epic', 'Adult Animation', 'Adventure Epic', 'Anime',
        'Buddy Comedy', 'ComingofAge', 'Computer Animation', 'Cop Drama',
        'Cyberpunk', 'Dark Comedy', 'Globetrotting Adventure', 'HandDrawn Animation',
        'Heist', 'HighConcept Comedy', 'Holiday Family', 'Jungle Adventure',
        'Kaiju', 'Legal Drama', 'Mockumentary', 'OnePerson Army Action', 'Parody',
        'Period Drama', 'Psychological Drama', 'Psychological Horror',
        'Psychological Thriller', 'Quest', 'Road Trip', 'Romantic Comedy',
        'Romantic Epic', 'Satire', 'SciFi Epic', 'Sea Adventure', 'Slapstick',
        'Slasher Horror', 'Splatter Horror', 'Superhero', 'Supernatural Fantasy',
        'Suspense Mystery', 'Swashbuckler', 'Sword Sandal', 'True Crime', 'Wuxia']).


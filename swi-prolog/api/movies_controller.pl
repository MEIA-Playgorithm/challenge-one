% Controller: catálogo de filmes e recomendações por semelhança.
:- module(movies_controller, [movie_json/2]).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_parameters)).
:- use_module(http_common).

:- http_handler(root(api/filmes), api_handle(get, list_movies), []).
:- http_handler(root(api/filme), api_handle(get, get_movie), []).
:- http_handler(root(api/recomendacoes), api_handle(get, similar_movies), []).

list_movies(Request) :-
    http_parameters(Request, [genre(Genre, [optional(true)]),
        pace(Pace, [optional(true)]), complexity(Complexity, [optional(true)]),
        limit(Limit, [integer, default(20)]), offset(Offset, [integer, default(0)])]),
    valid_page(Limit, Offset),
    valid_enum(Pace, [slow,medium,fast,unknown]),
    valid_enum(Complexity, [low,medium,high,unknown]),
    findall(Id, (facto(_, movie(Id, _)), matches(genre, Id, Genre),
        matches(pace, Id, Pace), matches(complexity, Id, Complexity)), Ids),
    length(Ids, Total), page(Ids, Offset, Limit, Selected),
    maplist(movie_json, Selected, Movies),
    reply_json_dict(_{total:Total, offset:Offset, limit:Limit, items:Movies}).

get_movie(Request) :-
    http_parameters(Request, [id(Id, [])]),
    require_movie(Id), movie_json(Id, Movie), reply_json_dict(Movie).

similar_movies(Request) :-
    http_parameters(Request, [id(Id, []), min_score(Min, [integer, default(0)]),
                              limit(Limit, [integer, default(10)])]),
    require_movie(Id), valid_page(Limit, 0),
    ( between(0,11,Min) -> true ; throw(api_error(400, 'min_score deve estar entre 0 e 11')) ),
    findall(Key-Other-Score, (facto(_, similarity_score(Id, Other, Score)),
        Score >= Min, Key is -Score), Candidates),
    sort(Candidates, Sorted), page(Sorted, 0, Limit, Selected),
    maplist(recommendation_json, Selected, Items), length(Sorted, Total),
    reply_json_dict(_{source_id:Id, total:Total, items:Items}).

recommendation_json(_-Id-Score, _{score:Score, movie:Movie}) :- movie_json(Id, Movie).

require_movie(Id) :-
    ( facto(_, movie(Id, _)) -> true ; throw(api_error(404, 'Filme não encontrado')) ).

valid_enum(Value, Allowed) :-
    ( var(Value) -> true ; memberchk(Value, Allowed) -> true
    ; throw(api_error(400, 'Valor de classificação inválido')) ).

matches(_, _, Value) :- var(Value), !.
matches(Predicate, Id, Value) :- Term =.. [Predicate,Id,Value], once(facto(_,Term)).

% Um filme em JSON: atributos simples (null se ausentes) e listas ordenadas.
movie_json(Id, Dict) :-
    once(facto(_, movie(Id, Title))),
    findall(P-Value, (member(P, [year,vote,duration,rating_mpa,rating_imdb,budget,
        win,nomination,oscar,pace,complexity,violence,humor,audience,psychological_intensity]),
        scalar_value(P,Id,Value)), Scalars),
    findall(P-Values, (member(P, [director,writer,star,genre,country_origin,
        filming_location,production_company,language,emotional_tone,themes,subgenre]),
        Term =.. [P,Id,V], findall(V,facto(_,Term),Raw), sort(Raw,Values)), Lists),
    append([id-Id,title-Title|Scalars], Lists, Pairs), dict_pairs(Dict, movie, Pairs).

scalar_value(P, Id, Value) :-
    Term =.. [P,Id,V], ( once(facto(_,Term)) -> Value=V ; Value=null ).

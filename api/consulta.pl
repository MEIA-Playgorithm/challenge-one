:- module(consulta, [start/0, start/1, stop/0]).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_parameters)).
:- use_module(library(lists)).
:- ensure_loaded('../sp_exp2.pl').
:- ensure_loaded('../filmes_bc.pl').
:- ensure_loaded('../rules_users.pl').
:- dynamic server_port/1.

:- http_handler(root(api/recomendacoes_utilizador), endpoint(user_recommendations), []).

:- http_handler(root(api/health), endpoint(health), []).
:- http_handler(root(api/filmes), endpoint(movies), []).
:- http_handler(root(api/filme), endpoint(movie), []).
:- http_handler(root(api/recomendacoes), endpoint(recommendations), []).

start :- start(8080).
start(Port) :-
    with_mutex(movie_api_start, start_locked(Port)).
start_locked(Port) :-
    ( server_port(Port) -> true
    ; server_port(_) -> throw(error(permission_error(start, server, Port), _))
    ; carrega_factos_filmes,
      setup_call_cleanup(open_null_stream(S), with_output_to(S, arranca_motor), close(S)),
      http_server(http_dispatch, [port(Port)]),
      assertz(server_port(Port)) ).
stop :- forall(retract(server_port(Port)), http_stop_server(Port, [])).

% CORS para desenvolvimento local, sem credenciais. Apenas leitura por HTTP.
endpoint(Action, Request) :-
    format('Access-Control-Allow-Origin: *\r\n'),
    format('Access-Control-Allow-Methods: GET, OPTIONS\r\n'),
    format('Access-Control-Allow-Headers: Content-Type\r\n'),
    memberchk(method(Method), Request),
    ( Method == options -> reply_json_dict(_{status:ok})
    ; Method == get -> catch(serve(Action, Request), Error, api_error(Error))
    ; reply_json_dict(_{error:method_not_allowed}, [status(405)]) ).

api_error(api_error(Status, Message)) :- !,
    reply_json_dict(_{error:Message}, [status(Status)]).
api_error(error(existence_error(http_parameter, Name), _)) :- !,
    format(atom(Message), 'Parâmetro obrigatório: ~w', [Name]),
    reply_json_dict(_{error:Message}, [status(400)]).
api_error(error(Formal, _)) :-
    ( Formal = type_error(_, _) ; Formal = domain_error(_, _) ), !,
    reply_json_dict(_{error:'Parâmetro inválido'}, [status(400)]).
api_error(Error) :-
    print_message(error, Error),
    reply_json_dict(_{error:internal_server_error}, [status(500)]).

serve(health, _) :- reply_json_dict(_{status:ok}).
serve(movies, Request) :-
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
serve(movie, Request) :-
    http_parameters(Request, [id(Id, [])]),
    require_movie(Id), movie_json(Id, Movie), reply_json_dict(Movie).
serve(recommendations, Request) :-
    http_parameters(Request, [id(Id, []), min_score(Min, [integer, default(0)]),
                              limit(Limit, [integer, default(10)])]),
    require_movie(Id), valid_page(Limit, 0),
    ( between(0,11,Min) -> true ; throw(api_error(400, 'min_score deve estar entre 0 e 11')) ),
    findall(Key-Other-Score, (facto(_, similarity_score(Id, Other, Score)),
        Score >= Min, Key is -Score), Candidates),
    sort(Candidates, Sorted), page(Sorted, 0, Limit, Selected),
    maplist(recommendation_json, Selected, Items), length(Sorted, Total),
    reply_json_dict(_{source_id:Id, total:Total, items:Items}).

serve(user_recommendations, Request) :-
    http_parameters(Request, [user_id(User, []), limit(Limit,[integer,default(10)]),
                             offset(Offset,[integer,default(0)])]),
    valid_page(Limit,Offset),
    ( user_fact(user(User)) -> true ; throw(api_error(404,'Utilizador não encontrado')) ),
    findall(Key-Id-Score-Reasons, (user_recommendation(User,Id,Score,Reasons),
        Key is -Score), Candidates),
    sort(Candidates,Sorted), length(Sorted,Total), page(Sorted,Offset,Limit,Selected),
    maplist(user_recommendation_json,Selected,Items),
    reply_json_dict(_{user_id:User,total:Total,offset:Offset,limit:Limit,items:Items}).

user_recommendation_json(_-Id-Score-Reasons, _{score:Score,reasons:Labels,movie:Movie}) :-
    maplist(reason_json,Reasons,Labels), movie_json(Id,Movie).
reason_json(Reason, _{type:Attribute,value:Value}) :-
    Reason =.. [Attribute,Value], user_preference_column(_,Attribute,_,_).
reason_json(wishlist, _{type:wishlist}).
reason_json(genre(G), _{type:genre,value:G}).
reason_json(language(L), _{type:language,value:L}).
reason_json(watched_similarity(Id), _{type:watched_similarity,movie_id:Id}).

require_movie(Id) :-
    ( facto(_, movie(Id, _)) -> true ; throw(api_error(404, 'Filme não encontrado')) ).
valid_page(Limit, Offset) :-
    ( between(1,100,Limit), Offset >= 0 -> true
    ; throw(api_error(400, 'limit: 1 a 100; offset: maior ou igual a 0')) ).
valid_enum(Value, Allowed) :-
    ( var(Value) -> true ; memberchk(Value, Allowed) -> true
    ; throw(api_error(400, 'Valor de classificação inválido')) ).
matches(_, _, Value) :- var(Value), !.
matches(Predicate, Id, Value) :- Term =.. [Predicate,Id,Value], once(facto(_,Term)).
page(List, Offset, Limit, Page) :-
    findall(X, (nth0(Index,List,X), Index >= Offset, Index < Offset+Limit), Page).

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
recommendation_json(_-Id-Score, _{score:Score, movie:Movie}) :- movie_json(Id,Movie).

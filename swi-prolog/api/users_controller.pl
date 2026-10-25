% Controller: recomendações personalizadas por utilizador.
:- module(users_controller, []).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_parameters)).
:- use_module(http_common).
:- use_module(movies_controller).

:- http_handler(root(api/recomendacoes_utilizador), api_handle(get, user_recommendations), []).
:- http_handler(root(api/'why-not'), api_handle(get, why_not), []).

user_recommendations(Request) :-
    http_parameters(Request, [user_id(User, []), limit(Limit,[integer,default(10)]),
                             offset(Offset,[integer,default(0)])]),
    valid_page(Limit,Offset),
    ( user_fact(user(User)) -> true ; throw(api_error(404,'Utilizador não encontrado')) ),
    findall(Key-Id-Score-Reasons, (user_recommendation(User,Id,Score,Reasons),
        recommendation_key(User,Id,Score,Key)), Candidates),
    sort(Candidates,Sorted), length(Sorted,Total), page(Sorted,Offset,Limit,Selected),
    maplist(user_recommendation_json(User),Selected,Items),
    reply_json_dict(_{user_id:User,total:Total,offset:Offset,limit:Limit,items:Items}).

user_recommendation_json(User, _-Id-Score-Reasons,
        _{score:Score,reasons:Labels,movie:Movie,status:Status,
          satisfied_requirements:Checks,unmet_preferences:Unmet,score_breakdown:Breakdown}) :-
    maplist(reason_json,Reasons,Labels), movie_json(Id,Movie),
    recommendation_explanation(User,Id,Status,RawChecks,RawUnmet),
    maplist(explanation_json,RawChecks,Checks), maplist(explanation_json,RawUnmet,Unmet),
    score_breakdown(User,Id,Breakdown).

% Porque um filme não foi recomendado: as razões de exclusão do motor (mesmo formato do Drools).
why_not(Request) :-
    http_parameters(Request, [user_id(User, []), movie(Id, [])]),
    ( user_fact(user(User)) -> true ; throw(api_error(404,'Utilizador não encontrado')) ),
    ( facto(_, movie(Id, _)) -> true ; throw(api_error(404,'Filme não encontrado')) ),
    movie_json(Id, Movie),
    (   user_recommendation(User, Id, _, _)
    ->  reply_json_dict(_{explanation_type:why_not, movie:Movie,
            conclusion:'O filme foi recomendado, por isso não há motivo de exclusão.'})
    ;   findall(_{type:'EXCLUSION', rule:Rule, movie_id:Id, details:Details},
            ( facto(_, exclusion_reason(User, Id, Reason)),
              Reason =.. [Rule|_], format(atom(Details), '~w', [Reason]) ), Exclusions),
        reply_json_dict(_{explanation_type:why_not, movie:Movie,
            conclusion:'O filme foi excluído pelas regras da lista exclusions.', exclusions:Exclusions})
    ).

explanation_json(Term, _{type:Type,arguments:Args}) :- Term =.. [Type|Args].

reason_json(rating(R), _{type:rating,value:R}).
reason_json(Reason, _{type:Attribute,value:Value}) :-
    Reason =.. [Attribute,Value], user_preference_column(_,Attribute,_,_).
reason_json(wishlist, _{type:wishlist}).
reason_json(genre(G), _{type:genre,value:G}).
reason_json(language(L), _{type:language,value:L}).
reason_json(liked_similarity(Id), _{type:liked_similarity,movie_id:Id}).

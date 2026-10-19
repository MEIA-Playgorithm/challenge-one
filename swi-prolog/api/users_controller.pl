% Controller: recomendações personalizadas por utilizador.
:- module(users_controller, []).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_parameters)).
:- use_module(http_common).
:- use_module(movies_controller).

:- http_handler(root(api/recomendacoes_utilizador), api_handle(get, user_recommendations), []).

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

explanation_json(Term, _{type:Type,arguments:Args}) :- Term =.. [Type|Args].

reason_json(rating(R), _{type:rating,value:R}).
reason_json(Reason, _{type:Attribute,value:Value}) :-
    Reason =.. [Attribute,Value], user_preference_column(_,Attribute,_,_).
reason_json(wishlist, _{type:wishlist}).
reason_json(genre(G), _{type:genre,value:G}).
reason_json(language(L), _{type:language,value:L}).
reason_json(liked_similarity(Id), _{type:liked_similarity,movie_id:Id}).

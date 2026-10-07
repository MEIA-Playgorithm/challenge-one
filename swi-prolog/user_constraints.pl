% Auxiliares puros das regras de produção e das explicações de recomendação.
:- use_module(library(pcre)).

movie_rating(M,R) :-
    facto(_,rating_imdb(M,Raw)),
    ( number(Raw) -> R=Raw
    ; atom(Raw), atomic_list_concat(Parts,',',Raw), atomic_list_concat(Parts,'.',Dot),
      catch(atom_number(Dot,R),_,fail) ), R>=0, R=<10.

movie_minutes(M,Minutes) :- facto(_,duration(M,Raw)), duration_minutes(Raw,Minutes).
duration_minutes(Raw,Minutes) :-
    atom(Raw), normalize_space(atom(Text),Raw),
    ( re_matchsub('^(?<h>[0-9]+)h(?:[ ]*(?<m>[0-9]+)m)?$',Text,D,[])
    -> number_string(H,D.h), (get_dict(m,D,MS),MS\=="" -> number_string(M,MS);M=0),
       M<60, Minutes is H*60+M
    ; re_matchsub('^(?<m>[0-9]+)m$',Text,D,[]), number_string(Minutes,D.m) ),
    Minutes>0.

session_age(U,Age) :-
    ( facto(_,user_limit(U,session_min_age,A)) -> Age=A
    ; facto(_,user_age(U,Age)) ).

% Falta de dados não comprova o cumprimento de um limite explícito.
failed_requirement(U,M,duration_limit(Max)) :-
    facto(_,user_limit(U,max_duration_minutes,Max)),
    \+ (movie_minutes(M,N),N=<Max).
failed_requirement(U,M,year_from(Min)) :-
    facto(_,user_limit(U,year_from,Min)),
    \+ (facto(_,year(M,Y)),number(Y),Y>=Min).
failed_requirement(U,M,year_to(Max)) :-
    facto(_,user_limit(U,year_to,Max)),
    \+ (facto(_,year(M,Y)),number(Y),Y=<Max).
failed_requirement(U,M,required_languages(Languages)) :-
    required_languages(U,Languages), Languages\=[],
    \+ (member(L,Languages),facto(_,language(M,L))).
failed_requirement(U,M,rating_limit(Min,Tolerance)) :-
    facto(_,user_limit(U,min_rating,Min)), effective_tolerance(U,Tolerance),
    \+ (movie_rating(M,R),R>=Min-Tolerance).
required_languages(U,Languages) :-
    findall(L,facto(_,user_limit(U,required_languages,L)),Raw),sort(Raw,Languages).
effective_tolerance(U,T) :-
    ( facto(_,user_limit(U,rating_required,true)) -> T=0
    ; facto(_,user_limit(U,rating_tolerance,V)) -> T=V ; T=0 ).

recommendation_status(U,M,alternative) :-
    facto(_,user_limit(U,min_rating,Min)),movie_rating(M,R),R<Min, !.
recommendation_status(_,_,main).

% Pesos máximos por grupo, para não multiplicar pontos por géneros/atores.
% Género 40; avaliação IMDb 0..30; realizador/atores 0..20; restantes 0..9.
recommendation_score(M,Pairs,Score) :-
    score_components(M,Pairs,G,R,D,S,E), Score is round((G+R+D+S+E)*100)/100.
score_components(M,Pairs,G,Rating,D,S,Extra) :-
    ( member(genre(_)-_,Pairs) -> G=40 ; G=0 ),
    ( movie_rating(M,R) -> Rating is round(300*R)/100 ; Rating=0 ),
    ( member(director(_)-_,Pairs) -> D=10 ; D=0 ),
    ( member(star(_)-_,Pairs) -> S=10 ; S=0 ),
    findall(W,(member(Reason-W,Pairs),secondary_reason(Reason),
               Reason\=liked_similarity(_)),Weights),sum_list(Weights,Sum),
    ( member(liked_similarity(_)-_,Pairs) -> History=1 ; History=0 ),
    Extra is min(9,Sum+History).
secondary_reason(R) :- R\=genre(_),R\=director(_),R\=star(_).
score_breakdown(U,M,_{genre:G,rating:R,director:D,star:S,secondary:E}) :-
    findall(Reason-W,preference_reason(U,M,Reason,W),Raw),sort(Raw,Pairs),
    score_components(M,Pairs,G,R,D,S,E).

% Recomendações principais antes de alternativas; depois pontuação e avaliação.
recommendation_key(U,M,Score,key(Tier,NegScore,NegRating,M)) :-
    recommendation_status(U,M,Status), (Status==main -> Tier=0 ; Tier=1),
    NegScore is -Score, (movie_rating(M,R)->NegRating is -R;NegRating=1).

requested_preference(U,genre(G)) :- facto(_,likes_genre(U,G)).
requested_preference(U,language(L)) :- facto(_,likes_language(U,L)).
requested_preference(U,R) :- facto(_,prefers(U,A,V)), R=..[A,V].

unmet_preference(U,M,R) :-
    requested_preference(U,R), \+ preference_reason(U,M,R,_).
unmet_preference(U,M,rating_below_target(R,Min)) :-
    facto(_,user_limit(U,min_rating,Min)),movie_rating(M,R),R<Min.

% Inclui limites cumpridos e dados efetivamente verificados.
satisfied_requirement(U,M,duration(N,Max)) :-
    facto(_,user_limit(U,max_duration_minutes,Max)),movie_minutes(M,N),N=<Max.
satisfied_requirement(U,M,year_from(Y,Min)) :-
    facto(_,user_limit(U,year_from,Min)),facto(_,year(M,Y)),number(Y),Y>=Min.
satisfied_requirement(U,M,year_to(Y,Max)) :-
    facto(_,user_limit(U,year_to,Max)),facto(_,year(M,Y)),number(Y),Y=<Max.
satisfied_requirement(U,M,required_language(L)) :-
    facto(_,user_limit(U,required_languages,L)),facto(_,language(M,L)).
satisfied_requirement(U,M,audience_age(A)) :- session_age(U,A),age_allowed(A,M).
satisfied_requirement(U,M,rating(R,Min,T)) :-
    facto(_,user_limit(U,min_rating,Min)),effective_tolerance(U,T),movie_rating(M,R),R>=Min-T.

recommendation_explanation(U,M,Status,Checks,Unmet) :-
    user_recommendation(U,M,_,_),recommendation_status(U,M,Status),
    findall(C,satisfied_requirement(U,M,C),Cs),sort(Cs,Checks),
    findall(P,unmet_preference(U,M,P),Ps),sort(Ps,Unmet).

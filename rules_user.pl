% Recomendações sobre os dados do inquérito e os factos já inferidos dos filmes.
:- ensure_loaded(user_bc).

matches_preferences(User, Movie) :- preference_reason(User, Movie, _, _).

excluded_movie(User, Movie) :- user_fact(watched(User, Movie)).
excluded_movie(User, Movie) :-
    user_fact(dislikes_genre(User,G)), facto(_,genre(Movie,G)).
excluded_movie(User, Movie) :-
    user_fact(dislikes_language(User,L)), facto(_,language(Movie,L)).
excluded_movie(User, Movie) :-
    user_fact(user_age(User,Age)), \+ age_allowed(Age,Movie).

% Política conservadora de recomendação, não uma classificação etária oficial.
% Para menores, classificações ausentes/desconhecidas são excluídas.
age_allowed(Age, _) :- Age >= 18, !.
age_allowed(Age, Movie) :-
    facto(_,rating_mpa(Movie,Rating)),
    memberchk(Rating-Min,['G'-0,'PG'-0,'PG-13'-13,'R'-18,'NC-17'-18]), Age >= Min.

preference_reason(U,M,genre(G),4) :-
    user_fact(likes_genre(U,G)), facto(_,genre(M,G)).
preference_reason(U,M,language(L),2) :-
    user_fact(likes_language(U,L)), facto(_,language(M,L)).
preference_reason(U,M,wishlist,6) :- user_fact(wishlist(U,M)).
% Histórico indica familiaridade, com peso reduzido; não implica gosto.
preference_reason(U,M,watched_similarity(Reference),1) :-
    user_fact(watched(U,Reference)), facto(_,similarity_score(Reference,M,Score)), Score >= 7.

recommend(User, Movie) :- user_recommendation(User,Movie,_,_).
user_recommendation(User, Movie, Score, Reasons) :-
    user_fact(user(User)), facto(_,movie(Movie,_)),
    \+ excluded_movie(User,Movie),
    findall(Reason-Weight,preference_reason(User,Movie,Reason,Weight),Raw),
    sort(Raw,Pairs), Pairs \= [],
    findall(Reason,member(Reason-_,Pairs),Reasons),
    % Uma única contribuição do histórico, mesmo com muitos filmes semelhantes.
    findall(W,(member(R-W,Pairs),R \= watched_similarity(_)),Weights),
    sum_list(Weights,Explicit),
    ( member(watched_similarity(_)-_,Pairs) -> Score is Explicit+1 ; Score=Explicit ).

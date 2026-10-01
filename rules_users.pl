% Regras de produção sobre utilizadores e filmes (IDs 34 em diante).
:- if(\+ current_predicate(arranca_motor/0)).
:- ensure_loaded(sp_exp1).
:- endif.
:- ensure_loaded(user_bc).
:- multifile regra/1.

regra 34
    se [watched(U, M)]
    entao [cria_facto(excluded_movie(U, M))].

regra 35
    se [dislikes_genre(U, G)
        e genre(M, G)]
    entao [cria_facto(excluded_movie(U, M))].

regra 36
    se [dislikes_language(U, L)
        e language(M, L)]
    entao [cria_facto(excluded_movie(U, M))].

regra 37
    se [user_age(U, Age)
        e movie(M, _)
        e teste(\+ age_allowed(Age, M))]
    entao [cria_facto(excluded_movie(U, M))].

regra 38
    se [likes_genre(U, G)
        e genre(M, G)]
    entao [cria_facto(preference_reason(U, M, genre(G), 4))].

regra 39
    se [likes_language(U, L)
        e language(M, L)]
    entao [cria_facto(preference_reason(U, M, language(L), 2))].

regra 40
    se [wishlist(U, M)
        e movie(M, _)]
    entao [cria_facto(preference_reason(U, M, wishlist, 6))].

regra 41
    se [watched(U, Reference)
        e similarity_score(Reference, M, Score)
        e teste(Score >= 7)]
    entao [cria_facto(preference_reason(U, M, watched_similarity(Reference), 1))].

regra 42
    se [prefers(U, director, V)
        e director(M, V)]
    entao [cria_facto(preference_reason(U, M, director(V), 3))].

regra 43
    se [prefers(U, writer, V)
        e writer(M, V)]
    entao [cria_facto(preference_reason(U, M, writer(V), 2))].

regra 44
    se [prefers(U, star, V)
        e star(M, V)]
    entao [cria_facto(preference_reason(U, M, star(V), 3))].

regra 45
    se [prefers(U, country_origin, V)
        e country_origin(M, V)]
    entao [cria_facto(preference_reason(U, M, country_origin(V), 1))].

regra 46
    se [prefers(U, subgenre, V)
        e subgenre(M, V)]
    entao [cria_facto(preference_reason(U, M, subgenre(V), 3))].

regra 47
    se [prefers(U, pace, V)
        e pace(M, V)]
    entao [cria_facto(preference_reason(U, M, pace(V), 2))].

regra 48
    se [prefers(U, complexity, V)
        e complexity(M, V)]
    entao [cria_facto(preference_reason(U, M, complexity(V), 2))].

regra 49
    se [prefers(U, violence, V)
        e violence(M, V)]
    entao [cria_facto(preference_reason(U, M, violence(V), 2))].

regra 50
    se [prefers(U, humor, V)
        e humor(M, V)]
    entao [cria_facto(preference_reason(U, M, humor(V), 2))].

regra 51
    se [prefers(U, psychological_intensity, V)
        e psychological_intensity(M, V)]
    entao [cria_facto(preference_reason(U, M, psychological_intensity(V), 2))].

regra 52
    se [prefers(U, emotional_tone, V)
        e emotional_tone(M, V)]
    entao [cria_facto(preference_reason(U, M, emotional_tone(V), 2))].

regra 53
    se [prefers(U, themes, V)
        e themes(M, V)]
    entao [cria_facto(preference_reason(U, M, themes(V), 3))].

regra 54
    se [prefers(U, audience, V)
        e audience(M, V)]
    entao [cria_facto(preference_reason(U, M, audience(V), 1))].

regra 55
    se [prefers(U, era, classic)
        e classic_movie(M)]
    entao [cria_facto(preference_reason(U, M, era(classic), 1))].

regra 56
    se [prefers(U, era, modern)
        e modern_movie(M)]
    entao [cria_facto(preference_reason(U, M, era(modern), 1))].

regra 57
    se [prefers(U, era, recent)
        e recent_movie(M)]
    entao [cria_facto(preference_reason(U, M, era(recent), 1))].

regra 58
    se [prefers(U, popularity, very_popular)
        e very_popular(M)]
    entao [cria_facto(preference_reason(U, M, popularity(very_popular), 1))].

regra 59
    se [prefers(U, popularity, popular)
        e popular(M)]
    entao [cria_facto(preference_reason(U, M, popularity(popular), 1))].

regra 60
    se [prefers(U, popularity, less_popular)
        e less_popular(M)]
    entao [cria_facto(preference_reason(U, M, popularity(less_popular), 1))].

regra 61
    se [preference_reason(U, M, _, _)]
    entao [cria_facto(matches_preferences(U, M))].

% Interfaces de consulta sobre os factos inferidos pelo motor.
matches_preferences(U, M) :- facto(_, matches_preferences(U, M)).
excluded_movie(U, M) :- facto(_, excluded_movie(U, M)).
preference_reason(U, M, Reason, Weight) :-
    facto(_, preference_reason(U, M, Reason, Weight)).

% Política conservadora de recomendação, não uma classificação etária oficial.
% Para menores, classificações ausentes/desconhecidas são excluídas.
age_allowed(Age, _) :- Age >= 18, !.
age_allowed(Age, Movie) :-
    facto(_,rating_mpa(Movie,Rating)),
    memberchk(Rating-Min,['G'-0,'PG'-0,'PG-13'-13,'R'-18,'NC-17'-18]), Age >= Min.

% Agregar apenas na consulta, depois de arranca_motor: os motivos podem surgir
% em várias passagens. Não materializar pontuações parciais nem recomendações
% antes de estarem concluídas todas as exclusões.
recommend(User, Movie) :- user_recommendation(User,Movie,_,_).
user_recommendation(User, Movie, Score, Reasons) :-
    facto(_, user(User)), facto(_,movie(Movie,_)),
    \+ excluded_movie(User,Movie),
    findall(Reason-Weight,preference_reason(User,Movie,Reason,Weight),Raw),
    sort(Raw,Pairs), Pairs \= [],
    findall(Reason,member(Reason-_,Pairs),Reasons),
    % Uma única contribuição do histórico, mesmo com muitos filmes semelhantes.
    findall(W,(member(R-W,Pairs),R \= watched_similarity(_)),Weights),
    sum_list(Weights,Explicit),
    ( member(watched_similarity(_)-_,Pairs) -> Score is Explicit+1 ; Score=Explicit ).

% Regras de produção sobre utilizadores e filmes (IDs 34 em diante).
:- if(\+ current_predicate(arranca_motor/0)).
:- ensure_loaded(sp_exp1).
:- endif.
:- ensure_loaded(user_bc).
:- multifile regra/1.
:- ensure_loaded(user_constraints).

regra 34
    se [watched(U, M)
        e teste(\+ facto(_, user_limit(U, allow_rewatch, true)))]
    entao [cria_facto(exclusion_reason(U, M, watched))].

regra 35
    se [dislikes_genre(U, G)
        e genre(M, G)]
    entao [cria_facto(exclusion_reason(U, M, disliked_genre(G)))].

regra 36
    se [dislikes_language(U, L)
        e language(M, L)]
    entao [cria_facto(exclusion_reason(U, M, disliked_language(L)))].

regra 37
    se [user(U)
        e movie(M, _)
        e recolhe(A, user_age(U, A), _)
        e recolhe(S, user_limit(U, session_min_age, S), _)
        e recolhe(R, rating_mpa(M, R), _)
        e teste(session_age(U, Age))
        e teste(\+ age_allowed(Age, M))]
    entao [cria_facto(exclusion_reason(U, M, audience_age(Age)))].

regra 38
    se [likes_genre(U, G)
        e genre(M, G)]
    entao [cria_facto(preference_reason(U, M, genre(G), 40))].

regra 39
    se [likes_language(U, L)
        e language(M, L)]
    entao [cria_facto(preference_reason(U, M, language(L), 2))].

regra 40
    se [wishlist(U, M)
        e movie(M, _)]
    entao [cria_facto(preference_reason(U, M, wishlist, 6))].

regra 41
    se [user_movie_rating(U, Reference, Rating)
        e teste(Rating >= 4)
        e similarity_score(Reference, M, Score)
        e teste(Score >= 7)]
    entao [cria_facto(preference_reason(U, M, liked_similarity(Reference), 1))].

regra 42
    se [prefers(U, director, V)
        e director(M, V)]
    entao [cria_facto(preference_reason(U, M, director(V), 10))].

regra 43
    se [prefers(U, writer, V)
        e writer(M, V)]
    entao [cria_facto(preference_reason(U, M, writer(V), 2))].

regra 44
    se [prefers(U, star, V)
        e star(M, V)]
    entao [cria_facto(preference_reason(U, M, star(V), 10))].

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

% Limites explícitos têm prioridade sobre todos os motivos positivos.
regra 62
    se [user_limit(U, disliked_directors, D) e director(M, D)]
    entao [cria_facto(exclusion_reason(U, M, disliked_director(D)))].

regra 63
    se [user_limit(U, disliked_stars, S) e star(M, S)]
    entao [cria_facto(exclusion_reason(U, M, disliked_star(S)))].

regra 64
    se [user(U) e movie(M, _)
        e recolhe(C-V, user_limit(U, C, V), _)
        e recolhe(D, duration(M, D), _)
        e recolhe(Y, year(M, Y), _)
        e recolhe(L, language(M, L), _)
        e recolhe(R, rating_imdb(M, R), _)
        e teste(failed_requirement(U, M, Reason))]
    entao [cria_facto(exclusion_reason(U, M, Reason))].

regra 65
    se [exclusion_reason(U, M, _)]
    entao [cria_facto(excluded_movie(U, M))].

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
    sort(Raw,Pairs),
    findall(Reason,member(Reason-_,Pairs),PreferenceReasons),
    ( movie_rating(Movie, Rating) -> Reasons=[rating(Rating)|PreferenceReasons]
    ; Reasons=PreferenceReasons ),
    recommendation_score(Movie, Pairs, Score).

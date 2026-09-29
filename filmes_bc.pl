% Base de filmes para o motor sp_exp1.pl.
:- ensure_loaded(sp_exp1).
:- ensure_loaded(movies_loader).

:- dynamic facto/2, ultimo_facto/1.

:- ensure_loaded(rules_movies).

% Só os predicados de dados do CSV são importados, não as regras Prolog.
predicado_filme(Predicate) :-
    member(Predicate, [movie, year, vote, director, writer, genre,
        country_origin, production_company, language, duration, rating_mpa,
        rating_imdb, budget, star, filming_location, win, nomination, oscar]).

carrega_factos_filmes :-
    load_movies,
    findall(Fact, (predicado_filme(Predicate),
                  Fact =.. [Predicate, _, _], call(Fact)), Facts),
    retractall(facto(_, _)),
    retractall(ultimo_facto(_)),
    retractall(justifica(_, _, _)),
    numera_factos_filmes(Facts, 0, Last),
    assertz(ultimo_facto(Last)).

numera_factos_filmes([], Last, Last).
numera_factos_filmes([Fact | Facts], Previous, Last) :-
    Number is Previous + 1,
    assertz(facto(Number, Fact)),
    numera_factos_filmes(Facts, Number, Last).

:- initialization(carrega_factos_filmes).

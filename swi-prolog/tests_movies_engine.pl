:- ensure_loaded(filmes_bc).
:- use_module(library(plunit)).

% Executar numa sessão de testes: swipl -q -s tests_movies_engine.pl -g run_tests -t halt
:- begin_tests(movies_engine, [setup(prepare_movies), cleanup(carrega_factos_filmes)]).

prepare_movies :-
    retractall(user:facto(_, _)),
    retractall(user:ultimo_facto(_)),
    retractall(user:justifica(_, _, _)),
    numera_factos_filmes([
        movie(a, 'A'), movie(b, 'B'), movie(c, 'C'), movie(d, 'D'),
        genre(a, 'Drama'), genre(a, 'Action'), genre(a, 'Psychological Drama'),
        genre(b, 'Action'), genre(c, 'Action'),
        language(a, 'English'), language(b, 'English'), language(c, 'English'),
        director(a, 'Director'), director(b, 'Director'),
        vote(a, 500000), vote(b, 499999), year(a, 2020), year(b, 1999)
    ], 0, Last),
    assertz(user:ultimo_facto(Last)),
    quiet_motor.

quiet_motor :-
    setup_call_cleanup(open_null_stream(Stream),
                       with_output_to(Stream, arranca_motor), close(Stream)).

test(priority) :-
    findall(V, user:facto(_, pace(a, V)), [fast]),
    findall(V, user:facto(_, complexity(a, V)), [high]).

test(unknown) :-
    forall(member(P, [pace, complexity, violence, humor,
                      psychological_intensity, emotional_tone, themes, audience]),
           (F =.. [P, d, unknown], assertion(user:facto(_, F)))).

test(boundaries) :-
    assertion(user:facto(_, mainstream(a))), assertion(user:facto(_, niche(b))),
    assertion(user:facto(_, recent_movie(a))), assertion(user:facto(_, movie_90s(b))),
    assertion(\+ user:facto(_, modern_movie(a))).

test(all_pairs) :-
    setof(A-B, N^(user:facto(N, similar_movie(A, B))),
          [a-b, a-c, b-a, b-c, c-a, c-b]),
    assertion(\+ user:facto(_, same_genre(a, a))),
    aggregate_all(count, user:facto(_, similarity_score(_, _, _)), 12).

test(score_and_genres) :-
    assertion(user:facto(_, similarity_score(a, b, 8))),
    assertion(user:facto(_, similarity_score(a, d, 0))),
    assertion(user:facto(_, get_genre(a, ['Action', 'Drama', 'Psychological Drama']))).

test(provenance) :-
    once(user:facto(N, pace(a, fast))),
    user:justifica(N, 1, Evidence),
    once(user:facto(Source, genre(a, 'Action'))),
    assertion(memberchk(Source, Evidence)),
    forall(member(E, Evidence), assertion(user:facto(E, _))).

test(idempotent) :-
    user:ultimo_facto(Before), quiet_motor, user:ultimo_facto(After),
    assertion(Before == After).

test(negation, [condition(current_predicate(user:como/1))]) :-
    assertion(user:verifica_condicao(nao(genre(d, 'Action')), _)),
    assertion(\+ user:verifica_condicao(nao(genre(a, 'Action')), _)),
    assertion(user:verifica_condicao(nao(avalia(vote(b, >=, 500000))), _)),
    assertion(\+ user:verifica_condicao(nao(avalia(vote(a, >=, 500000))), _)).

test(explanations, [condition(current_predicate(user:como/1))]) :-
    once(user:facto(N, pace(a, fast))),
    with_output_to(string(How), user:como(N)),
    assertion(sub_string(How, _, _, _, "pela regra 1")),
    with_output_to(string(Why), user:whynot(pace(a, slow))),
    assertion(sub_string(Why, _, _, _, "falhou")),
    with_output_to(string(Missing), user:whynot(inexistente(a))),
    assertion(sub_string(Missing, _, _, _, "não está definido")).

:- end_tests(movies_engine).

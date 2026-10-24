% Executar: swipl -q -s tests_dialog.pl -g run_tests -t halt
:- ensure_loaded(sp_exp2).
:- ensure_loaded(filmes_bc).
:- use_module(library(plunit)).

:- begin_tests(dialog, [setup(prepara), cleanup(limpa)]).

prepara :-
    retractall(user:facto(_, _)),
    retractall(user:ultimo_facto(_)),
    retractall(user:justifica(_, _, _)),
    retractall(user:resposta_utilizador(_, _)),
    assertz(user:ultimo_facto(0)),
    user:regista_facto_utilizador(user(ana)),
    user:regista_facto_utilizador(utilizador_atual(ana)).

limpa :-
    retractall(user:resposta_utilizador(_, _)),
    user:carrega_factos_filmes.

executa(Texto, Saida) :-
    current_input(Anterior),
    setup_call_cleanup(open_string(Texto, Stream),
        setup_call_cleanup(set_input(Stream),
            with_output_to(string(Saida), user:arranca_motor),
            set_input(Anterior)), close(Stream)).

test(ramos, [forall(member(Opcao-Genero,
    [comedia-'Comedy', acao-'Action', misterio-'Mystery',
     terror-'Horror', ficcao_cientifica-'SciFi', fantasia-'Fantasy']))]) :-
    prepara,
    format(string(Entrada), '~w.~nsim.~n', [Opcao]),
    executa(Entrada, _),
    assertion(user:facto(_, sugerir_genero(ana, Genero))),
    findall(E, user:facto(_, experiencia_sessao(ana, E)), [Opcao]),
    aggregate_all(count, user:resposta_utilizador(_, _), 1),
    executa('', Saida),
    assertion(Saida == "").

test(emocao) :-
    prepara,
    executa('emocao. sim. sim. sim.', _),
    assertion(user:facto(_, sugerir_tom(ana, triste))),
    once(user:facto(N, sugerir_tom(ana, triste))),
    assertion(user:justifica(N, dialogo_3, _)).

test(negativa) :-
    prepara,
    executa('comedia. nao.', _),
    assertion(user:facto(_, sugerir_genero(ana, 'Comedy'))),
    assertion(\+ user:facto(_, sugerir_genero(ana, 'Romantic Comedy'))),
    executa('', Saida),
    assertion(Saida == "").

test(porque_e_opcao_invalida) :-
    prepara,
    executa('porque. invalida. comedia. porque. sim.', Saida),
    assertion(sub_string(Saida, _, _, _, 'Estou a avaliar a regra dialogo_experiencia')),
    assertion(sub_string(Saida, _, _, _, 'Opção inválida')),
    assertion(sub_string(Saida, _, _, _, 'Estou a avaliar a regra dialogo_comedia_2')),
    assertion(user:facto(_, sugerir_genero(ana, 'Romantic Comedy'))).

:- end_tests(dialog).

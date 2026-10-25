% Versão preparada para lidar com regras que contenham negação (nao)
% Metaconhecimento
% Compatível com filmes_bc.pl; não exige um índice facto_dispara_regras/2.
% Explicações como?(how?) e porque não?(whynot?)

:-op(220,xfx,entao).
:-op(35,xfy,se).
:-op(240,fx,regra).
:-op(500,fy,nao).
:-op(600,xfy,e).

:-dynamic justifica/3.
:- dynamic perguntavel/1, resposta_utilizador/2.
:- multifile perguntavel/1.
:- multifile opcoes_pergunta/2.
:- dynamic(regra/1).


carrega_bc:-
		write('NOME DA BASE DE CONHECIMENTO (terminar com .)-> '),
		read(NBC),
		consult(NBC).

arranca_motor :-
    ultimo_facto(Before),
    forall((regra ID se LHS entao RHS,
            verifica_condicoes(LHS, Evidence, contexto(ID, LHS, RHS))),
           concluir(RHS, ID, Evidence)),
    ultimo_facto(After),
    ( After =:= Before -> true ; arranca_motor ).

% Interação apenas no motor; como/1 e whynot/1 continuam a usar os
% verificadores originais, sem perguntas.
% A BC pode declarar, por exemplo: perguntavel(likes_genre(_, _)).
% Só se pergunta por factos completamente instanciados: as condições
% anteriores devem fornecer os valores das variáveis.
% Ao reiniciar a BC, limpar também retractall(resposta_utilizador(_, _)).
verifica_condicoes([X e Y], Evidence, Contexto) :-
    !,
    verifica_condicao(X, First, Contexto),
    verifica_condicoes([Y], Rest, Contexto),
    append(First, Rest, Evidence).
verifica_condicoes([X], Evidence, Contexto) :-
    verifica_condicao(X, Evidence, Contexto).

% A chave está instanciada; o valor é preenchido pela escolha do utilizador.
verifica_condicao(escolha(Chave, Valor), [N], Contexto) :-
    !,
    ground(Chave),
    ( facto(N, escolha(Chave, Guardado)) -> Valor = Guardado
    ; opcoes_pergunta(Chave, Opcoes),
      le_escolha(Chave, Opcoes, Contexto, Selecionado),
      regista_facto_utilizador(escolha(Chave, Selecionado)),
      facto(N, escolha(Chave, Selecionado)),
      Valor = Selecionado ).
verifica_condicao(X, Evidence, Contexto) :-
    ( ground(X), condicao_perguntavel(X) ->
        ( facto(N, X) -> Evidence = [N]
        ; pergunta_facto(X, Contexto), facto(N, X), Evidence = [N] )
    ; verifica_condicao(X, Evidence) ).

% Os operadores do motor nãosão perguntas, mesmo com uma declaração ampla.
condicao_perguntavel(X) :-
    callable(X),
    functor(X, Nome, Aridade),
    \+ memberchk(Nome/Aridade, [(nao)/1, avalia/1, teste/1, recolhe/3, escolha/2]),
    once(perguntavel(X)).

pergunta_facto(Facto, Contexto) :-
    ( resposta_utilizador(Facto, Resposta) -> Resposta == sim
    ; le_resposta(Facto, Contexto, Resposta),
      assertz(resposta_utilizador(Facto, Resposta)),
      ( Resposta == sim -> regista_facto_utilizador(Facto) ; fail ) ).

% Without a console (HTTP API): resposta_externa(+Question, +Options, +Context, -Answer)
% replaces read/1. Only exists during a request (see api/dialogue_controller.pl).
:- dynamic resposta_externa/4.

le_escolha(Chave, Opcoes, Contexto, Resposta) :-
    resposta_externa(Chave, Opcoes, Contexto, Resposta), !.
le_escolha(Chave, Opcoes, Contexto, Resposta) :-
    ( current_predicate(texto_pergunta/2), texto_pergunta(Chave, Texto)
    -> format('~a~n', [Texto])
    ; format('Escolhe uma opção para ~q.~n', [Chave]) ),
    format('Opções: ~w. Escreve uma opção ou porque, terminando com ponto.~n', [Opcoes]),
    read(Entrada),
    ( Entrada == porque ->
        porque(escolha(Chave, _), Contexto),
        le_escolha(Chave, Opcoes, Contexto, Resposta)
    ; Entrada == end_of_file ->
        throw(error(unexpected_end_of_file, le_escolha/4))
    ; ground(Entrada), memberchk(Entrada, Opcoes) -> Resposta = Entrada
    ; writeln('Opção inválida. Escolhe uma das opções apresentadas.'),
      le_escolha(Chave, Opcoes, Contexto, Resposta) ).

le_resposta(Facto, Contexto, Resposta) :-
    resposta_externa(Facto, [sim, nao], Contexto, Resposta), !.
le_resposta(Facto, Contexto, Resposta) :-
    ( current_predicate(texto_pergunta/2), texto_pergunta(Facto, Texto) ->
		format('~a (sim/nao/porque, terminar com .)~n', [Texto])
	; format('É verdade ~q? (sim/nao/porque, terminar com .)~n', [Facto])
	),
    read(Entrada),
    ( Entrada == porque ->
        porque(Facto, Contexto), le_resposta(Facto, Contexto, Resposta)
    ; Entrada == sim -> Resposta = sim
    ; Entrada == nao -> Resposta = nao
    ; Entrada == end_of_file ->
        throw(error(unexpected_end_of_file, le_resposta/3))
    ; writeln('Resposta inválida. Use sim, nao ou porque.'),
      le_resposta(Facto, Contexto, Resposta) ).

% Explicação durante a pergunta: não afirma que a regra já foi satisfeita.
porque(Facto, contexto(ID, LHS, RHS)) :-
    format('Estou a avaliar a regra ~w.~n', [ID]),
    format('Condições: ~q~n', [LHS]),
    format('Preciso de saber se ~q para verificar esta condição.~n', [Facto]),
    format('Se todas as condições forem satisfeitas, as ações serão: ~q~n', [RHS]).

% Facto de entrada: sem justifica/3, como os restantes factos iniciais.
regista_facto_utilizador(Facto) :-
    retract(ultimo_facto(Anterior)),
    N is Anterior + 1,
    assertz(ultimo_facto(N)),
    assertz(facto(N, Facto)).

verifica_condicoes([X e Y], Evidence) :-
    !,
    verifica_condicao(X, First),
    verifica_condicoes([Y], Rest),
    append(First, Rest, Evidence).
verifica_condicoes([X], Evidence) :- verifica_condicao(X, Evidence).

% Negação por ausência: as variáveis devem ser ligadas por condições anteriores.
verifica_condicao(nao avalia(X), [nao avalia(X)]) :- !, \+ avalia(_, X).
verifica_condicao(nao X, [nao X]) :- !, \+ facto(_, X).
verifica_condicao(avalia(X), [N]) :- !, avalia(N, X).
% Testes puros: comparação, pertença e cálculo sem alterar a base.
verifica_condicao(teste(Goal), []) :- !, call(Goal).
% Recolhe também os números dos factos usados, para a justificação.
verifica_condicao(recolhe(Template, Pattern, Values), Evidence) :-
    !,
    findall(Template-N, facto(N, Pattern), Pairs),
    findall(Value, member(Value-_, Pairs), Values),
    findall(N, member(_-N, Pairs), Evidence).
verifica_condicao(X, [N]) :- facto(N, X).


concluir([cria_facto(F)|Y],ID,LFactos):-
	!,
	cria_facto(F,ID,LFactos),
	concluir(Y,ID,LFactos).

concluir([],_,_):-!.



cria_facto(F,_,_):-
	facto(_,F),!.

cria_facto(F,ID,LFactos):-
	retract(ultimo_facto(N1)),
	N is N1+1,
	asserta(ultimo_facto(N)),
	assertz(justifica(N,ID,LFactos)),
	assertz(facto(N,F)),
	write('Foi concluído o facto nº '),write(N),write(' -> '),write(F),nl,!.



avalia(N,P):-	P=..[Functor,Entidade,Operando,Valor],
		P1=..[Functor,Entidade,Valor1],
		facto(N,P1),
		compara(Valor1,Operando,Valor).

compara(V1,==,V):- V1==V.
compara(V1,\==,V):- V1\==V.
compara(V1,>,V):-V1>V.
compara(V1,<,V):-V1<V.
compara(V1,>=,V):-V1>=V.
compara(V1,=<,V):-V1=<V.


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Visualização da base de factos

mostra_factos:-
	findall(N, facto(N, _), LFactos),
	escreve_factos(LFactos).


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Geração de explicações do tipo "Como"

como(N):-ultimo_facto(Last),Last<N,!,
	write('Essa conclusão não foi tirada'),nl,nl.
como(N):-justifica(N,ID,LFactos),!,
	facto(N,F),
	write('Conclui o facto nº '),write(N),write(' -> '),write(F),nl,
	write('pela regra '),write(ID),nl,
	write('por se ter verificado que:'),nl,
	escreve_factos(LFactos),
	write('********************************************************'),nl,
	explica(LFactos).
como(N):-facto(N,F),
	write('O facto nº '),write(N),write(' -> '),write(F),nl,
	write('foi conhecido inicialmente'),nl,
	write('********************************************************'),nl.


escreve_factos([I|R]):-facto(I,F), !,
	write('O facto nº '),write(I),write(' -> '),write(F),write(' é verdadeiro'),nl,
	escreve_factos(R).
escreve_factos([I|R]):-
	write('A condição '),write(I),write(' é verdadeira'),nl,
	escreve_factos(R).
escreve_factos([]).

explica([I|R]):- \+ integer(I),!,explica(R).
explica([I|R]):-como(I),
		explica(R).
explica([]):-	write('********************************************************'),nl.




%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Geração de explicações do tipo "Porque nao"
% Exemplo: ?- whynot(classe(meu_veículo,ligeiro)).

whynot(Facto):-
	whynot(Facto,1).

whynot(Facto,_):-
	facto(_, Facto),
	!,
	write('O facto '),write(Facto),write(' não é falso!'),nl.
whynot(Facto,Nivel):-
	encontra_regras_whynot(Facto,LLPF),
    LLPF \= [], !,
	whynot1(LLPF,Nivel).
whynot(nao Facto,Nivel):-
	formata(Nivel),write('Porque:'),write(' O facto '),write(Facto),
	write(' é verdadeiro'),nl.
whynot(Facto,Nivel):-
	formata(Nivel),write('Porque:'),write(' O facto '),write(Facto),
	write(' não está definido na base de conhecimento'),nl.

%  As explicações do whynot(Facto) devem considerar todas as regras que poderiam dar origem a conclusão relativa ao facto Facto

encontra_regras_whynot(Facto,LLPF):-
	findall((ID,LPF),
		(
		regra ID se LHS entao RHS,
		member(cria_facto(Facto),RHS),
		encontra_premissas_falsas(LHS,LPF),
		LPF \== []
		),
		LLPF).

whynot1([],_).
whynot1([(ID,LPF)|LLPF],Nivel):-
	formata(Nivel),write('Porque pela regra '),write(ID),write(':'),nl,
	Nivel1 is Nivel+1,
	explica_porque_nao(LPF,Nivel1),
	whynot1(LLPF,Nivel).

% Para na primeira condição que falha, evitando testar cálculos sem variáveis ligadas.
encontra_premissas_falsas([X e Y], LPF) :-
    !,
    ( verifica_condicao(X, _) -> encontra_premissas_falsas([Y], LPF)
    ; LPF = [X] ).
encontra_premissas_falsas([X], LPF) :-
    ( verifica_condicao(X, _) -> LPF = [] ; LPF = [X] ).


explica_porque_nao([],_).
explica_porque_nao([teste(Goal)|LPF], Nivel) :-
    !, formata(Nivel), write('O teste '), write(Goal), write(' falhou'), nl,
    explica_porque_nao(LPF, Nivel).
explica_porque_nao([nao avalia(X)|LPF],Nivel):-
	!,
	formata(Nivel),write('A condição nao '),write(X),write(' é falsa'),nl,
	explica_porque_nao(LPF,Nivel).
explica_porque_nao([avalia(X)|LPF],Nivel):-
	!,
	formata(Nivel),write('A condição '),write(X),write(' é falsa'),nl,
	explica_porque_nao(LPF,Nivel).
explica_porque_nao([P|LPF],Nivel):-
	formata(Nivel),write('A premissa '),write(P),write(' é falsa'),nl,
	Nivel1 is Nivel+1,
	whynot(P,Nivel1),
	explica_porque_nao(LPF,Nivel).

formata(Nivel):-
	Esp is (Nivel-1)*5, tab(Esp).

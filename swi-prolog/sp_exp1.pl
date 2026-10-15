

:-op(220,xfx,entao).
:-op(35,xfy,se).
:-op(240,fx,regra).
:-op(600,xfy,e).

:-dynamic justifica/3.

% Carregamento da Base de Conhecimento

carrega_bc:-
	write('NOME DA BASE DE CONHECIMENTO (terminar com .)-> '),
% usar se necessario caminho absoluto com / e colocar entre plicas
		read(NBC),
		consult(NBC).

% Arranque do Motor de Inferência

% Executa todas as combinações até não surgirem novos factos.
arranca_motor :-
    ultimo_facto(Before),
    forall((regra ID se LHS entao RHS, verifica_condicoes(LHS, Evidence)),
           concluir(RHS, ID, Evidence)),
    ultimo_facto(After),
    ( After =:= Before -> true ; arranca_motor ).

verifica_condicoes([X e Y], Evidence) :-
    !,
    verifica_condicao(X, First),
    verifica_condicoes([Y], Rest),
    append(First, Rest, Evidence).
verifica_condicoes([X], Evidence) :- verifica_condicao(X, Evidence).

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


% Aplicar o RHS da regra que foi disparada com sucesso

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



% Visualização da base de factos

mostra_factos:-
	findall(N, facto(N, _), LFactos),
	escreve_factos(LFactos).

escreve_factos([I|R]):-facto(I,F),
	write('O facto nº '),write(I),write(' -> '),write(F),nl,
	escreve_factos(R).
escreve_factos([]).





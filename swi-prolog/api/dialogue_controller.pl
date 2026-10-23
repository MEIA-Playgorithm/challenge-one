% Controller: o diálogo de rules_dialog.pl sem consola.
% Cada pedido traz o utilizador e as respostas já dadas. O motor corre as regras
% do diálogo de novo dentro de snapshot/1 (nada fica na base nem chega a outros
% pedidos) e para na primeira pergunta sem resposta. Para cada pergunta devolve
% o "porque": a regra em avaliação, as condições e o que conclui. No fim junta
% as sugestões do diálogo às recomendações do utilizador (picks).
:- module(dialogue_controller, []).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(http_common).
:- use_module(movies_controller).

:- http_handler(root(api/dialogo), api_handle(post, dialogue), []).

:- dynamic resposta_dada/2, pergunta_feita/4.

dialogue(Request) :-
    json_body(Request, Body),
    ( get_dict(user_id, Body, User), atom(User), User \== '' -> true
    ; throw(api_error(400, 'user_id é obrigatório')) ),
    ( get_dict(answers, Body, Answers) -> true ; Answers = _{} ),
    ( is_dict(Answers) -> true ; throw(api_error(400, 'answers tem de ser um objeto')) ),
    ( user_fact(user(User)) -> true ; throw(api_error(404, 'Utilizador não encontrado')) ),
    dict_pairs(Answers, _, Pairs),
    maplist(valid_answer(User), Pairs, Given),
    snapshot(run_dialogue(User, Given, Reply)),
    reply_json_dict(Reply).

json_body(Request, Body) :-
    catch(http_read_json_dict(Request, Body, [value_string_as(atom)]), _, fail),
    is_dict(Body), !.
json_body(_, _) :- throw(api_error(400, 'O corpo tem de ser um objeto JSON')).

% Cada resposta tem de ser de uma pergunta do diálogo e uma das suas opções.
valid_answer(User, Name-Value, Question-Value) :-
    ( question(User, Name, Question, Options) -> true
    ; format(atom(Message), 'Pergunta desconhecida: ~w', [Name]),
      throw(api_error(400, Message)) ),
    ( atom(Value), memberchk(Value, Options) -> true
    ; format(atom(Message), 'Resposta inválida para ~w; opções: ~w', [Name, Options]),
      throw(api_error(400, Message)) ).

% As perguntas do diálogo são todas sobre o utilizador: escolhas
% (opcoes_pergunta/2) e perguntas de sim ou não (perguntavel/1).
question(User, Name, Question, Options) :-
    ( opcoes_pergunta(Question, Options) ; perguntavel(Question), Options = [sim, nao] ),
    Question =.. [QuestionName, User], QuestionName == Name, !.

run_dialogue(User, Given, _{user_id:User, history:History, question:Pending,
                            conclusions:Conclusions, picks:Picks}) :-
    forall(member(Question-Value, Given), assertz(resposta_dada(Question, Value))),
    assertz((user:resposta_externa(P, Os, Cx, A) :- dialogue_controller:answer(P, Os, Cx, A))),
    ultimo_facto(Before),
    regista_facto_utilizador(utilizador_atual(User)),
    setup_call_cleanup(open_null_stream(Null),
        with_output_to(Null, catch(dialogue_engine, pending(Q, O, C), true)),
        close(Null)),
    findall(Item, (pergunta_feita(Question, Options, Context, Answer),
                   question_json(Question, Options, Context, Json),
                   Item = Json.put(answer, Answer)), History),
    ( nonvar(Q) -> question_json(Q, O, C, Pending) ; Pending = null ),
    findall(Conclusion, (justifica(N, Rule, Evidence), N > Before,
                         conclusion_json(N, Rule, Evidence, Conclusion)), Conclusions),
    session_picks(User, Picks).

% Chamado pelo motor no lugar de read/1: usa a resposta dada ou para o motor.
answer(Question, Options, Context, Answer) :-
    ( resposta_dada(Question, Answer)
    -> assertz(pergunta_feita(Question, Options, Context, Answer))
    ; throw(pending(Question, Options, Context)) ).

% Como arranca_motor/0, mas só com as regras do diálogo (identificadores
% dialogo*). Só dependem dos utilizadores; correr todas demoraria segundos.
dialogue_engine :-
    ultimo_facto(Before),
    forall((regra ID se LHS entao RHS, dialogue_rule(ID),
            verifica_condicoes(LHS, Evidence, contexto(ID, LHS, RHS))),
           concluir(RHS, ID, Evidence)),
    ultimo_facto(After),
    ( After =:= Before -> true ; dialogue_engine ).

dialogue_rule(ID) :- atom(ID), sub_atom(ID, 0, _, _, dialogo).

% O mesmo que porque/2 mostra na consola, em JSON. `asking` é a posição da
% condição perguntada: as anteriores já se verificaram.
question_json(Question, Options, contexto(Rule, LHS, RHS),
              _{key:Key, text:Text, options:Options,
                why:_{rule:Rule, conditions:Conditions, asking:Asking, concludes:Concludes}}) :-
    Question =.. [Key|_],
    question_text(Question, Options, Text),
    copy_term(Question-LHS-RHS, Q-L-R),
    numbervars(Q-L-R, 0, _, [singletons(true)]),
    conditions(L, Terms),
    ( nth0(Asking, Terms, Term), asks(Q, Term) -> true ; Asking = null ),
    maplist(term_json, Terms, Conditions),
    findall(Fact, member(cria_facto(Fact), R), Facts),
    maplist(term_json, Facts, Concludes).

question_text(Question, _, Text) :- texto_pergunta(Question, Text), !.
question_text(Question, [sim, nao], Text) :- !, format(string(Text), 'É verdade ~q?', [Question]).
question_text(Question, _, Text) :- format(string(Text), 'Escolhe uma opção para ~q.', [Question]).

conditions([X e Y], [X|Rest]) :- !, conditions([Y], Rest).
conditions([X], [X]).

asks(Question, escolha(Key, _)) :- Key == Question, !.
asks(Question, Condition) :- Condition == Question.

% Uma conclusão do diálogo e os factos que a justificam (como/1 da consola).
conclusion_json(N, Rule, Evidence, _{fact:Fact, rule:Rule, premises:Premises}) :-
    facto(N, Term), term_json(Term, Fact),
    maplist(premise_json, Evidence, Premises).

premise_json(N, Json) :- integer(N), facto(N, Term), !, term_json(Term, Json).
premise_json(Term, Json) :- term_json(Term, Json).

% Um termo como texto Prolog e também por partes (nome e argumentos sem aspas;
% null numa variável ainda por ligar), para a interface o descrever por palavras.
term_json(Term, _{text:Text, name:Name, args:Args}) :-
    term_text(Term, Text),
    ( compound(Term) -> Term =.. [Name|Raw] ; Name = Term, Raw = [] ),
    maplist(arg_json, Raw, Args).

arg_json('$VAR'(_), null) :- !.
arg_json(Arg, Text) :- format(string(Text), '~W', [Arg, [numbervars(true)]]).

term_text(Term, Text) :-
    format(string(Text), '~W', [Term, [quoted(true), numbervars(true), portray(true)]]).

% Picks: as recomendações do utilizador (já sem os filmes que os seus limites
% excluem) que correspondem às sugestões do diálogo. Primeiro as que cumprem mais
% sugestões; depois a ordem das recomendações (recommendation_key/4).
session_picks(User, Picks) :-
    findall(k(Count, Key)-Id-Score-Matches,
            ( user_recommendation(User, Id, Score, _),
              findall(Match, session_match(User, Id, Match), Raw), sort(Raw, Matches),
              Matches \== [], length(Matches, Length), Count is -Length,
              recommendation_key(User, Id, Score, Key) ),
            Candidates),
    sort(Candidates, Sorted),
    length(Sorted, Total), Max is min(Total, 12), length(Selected, Max),
    append(Selected, _, Sorted),
    maplist(pick_json(User), Selected, Picks).

pick_json(User, _-Id-Score-Matches, _{movie:Movie, score:Score, status:Status, matches:Json}) :-
    movie_json(Id, Movie),
    recommendation_status(User, Id, Status),
    maplist([Type-Value, _{type:Type, value:Value}]>>true, Matches, Json).

% Cada sugestão do diálogo e o atributo do filme que lhe corresponde.
session_match(User, Id, genre-Genre) :-
    facto(_, sugerir_genero(User, Genre)), facto(_, genre(Id, Genre)).
session_match(User, Id, emotional_tone-sad) :-
    facto(_, sugerir_tom(User, triste)), facto(_, emotional_tone(Id, sad)).
session_match(User, Id, themes-supernatural) :-
    facto(_, preferencia_sessao(User, sobrenatural)), facto(_, themes(Id, supernatural)).

% Controller: the rules_dialog.pl dialogue without a console.
% Each request carries the user and the answers so far. The engine reruns the
% dialogue rules inside snapshot/1 (nothing stays in the database or leaks to
% other requests) and stops at the first unanswered question. Each question
% comes with its "why": the rule being evaluated, its conditions and what it
% concludes. Finally it matches the dialogue suggestions against the user's
% recommendations (picks).
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

% Each answer must belong to a dialogue question and be one of its options.
valid_answer(User, Name-Value, Question-Value) :-
    ( question(User, Name, Question, Options) -> true
    ; format(atom(Message), 'Pergunta desconhecida: ~w', [Name]),
      throw(api_error(400, Message)) ),
    ( atom(Value), memberchk(Value, Options) -> true
    ; format(atom(Message), 'Resposta inválida para ~w; opções: ~w', [Name, Options]),
      throw(api_error(400, Message)) ).

% Dialogue questions are all about the user: choices (opcoes_pergunta/2)
% and yes/no questions (perguntavel/1).
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

% Called by the engine instead of read/1: uses the given answer or stops the engine.
answer(Question, Options, Context, Answer) :-
    ( resposta_dada(Question, Answer)
    -> assertz(pergunta_feita(Question, Options, Context, Answer))
    ; throw(pending(Question, Options, Context)) ).

% Like arranca_motor/0, but only the dialogue rules (ids dialogo*). They only
% depend on users; running every rule would take seconds.
dialogue_engine :-
    ultimo_facto(Before),
    forall((regra ID se LHS entao RHS, dialogue_rule(ID),
            verifica_condicoes(LHS, Evidence, contexto(ID, LHS, RHS))),
           concluir(RHS, ID, Evidence)),
    ultimo_facto(After),
    ( After =:= Before -> true ; dialogue_engine ).

dialogue_rule(ID) :- atom(ID), sub_atom(ID, 0, _, _, dialogo).

% What porque/2 shows in the console, as JSON. `asking` is the index of the
% asked condition: earlier ones already hold.
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

% A dialogue conclusion and the facts behind it (console como/1).
conclusion_json(N, Rule, Evidence, _{fact:Fact, rule:Rule, premises:Premises}) :-
    facto(N, Term), term_json(Term, Fact),
    maplist(premise_json, Evidence, Premises).

premise_json(N, Json) :- integer(N), facto(N, Term), !, term_json(Term, Json).
premise_json(Term, Json) :- term_json(Term, Json).

% A term as Prolog text and also by parts (unquoted name and args; null for an
% unbound variable), so the UI can describe it in words.
term_json(Term, _{text:Text, name:Name, args:Args}) :-
    term_text(Term, Text),
    ( compound(Term) -> Term =.. [Name|Raw] ; Name = Term, Raw = [] ),
    maplist(arg_json, Raw, Args).

arg_json('$VAR'(_), null) :- !.
arg_json(Arg, Text) :- format(string(Text), '~W', [Arg, [numbervars(true)]]).

term_text(Term, Text) :-
    format(string(Text), '~W', [Term, [quoted(true), numbervars(true), portray(true)]]).

% Picks: the user's recommendations (already without movies their limits
% exclude) that match the dialogue suggestions. Most matches first, then the
% recommendation order (recommendation_key/4).
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

% Each dialogue suggestion and the movie attribute it maps to.
session_match(User, Id, genre-Genre) :-
    facto(_, sugerir_genero(User, Genre)), facto(_, genre(Id, Genre)).
session_match(User, Id, emotional_tone-sad) :-
    facto(_, sugerir_tom(User, triste)), facto(_, emotional_tone(Id, sad)).
session_match(User, Id, themes-supernatural) :-
    facto(_, preferencia_sessao(User, sobrenatural)), facto(_, themes(Id, supernatural)).

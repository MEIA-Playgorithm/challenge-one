% Partilhado pelos controllers: CORS, método HTTP, erros JSON e paginação.
:- module(http_common, [api_handle/3, valid_page/2, page/4]).
:- use_module(library(http/http_json)).
:- use_module(library(lists)).

:- meta_predicate api_handle(+, 1, +).

% api_handle(+Metodo, :Handler, +Request)
% Junta CORS (desenvolvimento local, sem credenciais), só chama o Handler se o
% método HTTP for o esperado, converte erros em JSON e regista o pedido.
api_handle(Method, Handler, Request) :-
    get_time(Start),
    upcase_atom(Method, Upper),
    format('Access-Control-Allow-Origin: *
'),
    format('Access-Control-Allow-Methods: ~w, OPTIONS
', [Upper]),
    format('Access-Control-Allow-Headers: Content-Type
'),
    memberchk(method(Actual), Request),
    (   Actual == options -> reply_json_dict(_{status:ok}), Status = 200
    ;   Actual == Method  -> catch((call(Handler, Request), Status = 200),
                                   Error, api_error(Error, Status))
    ;   reply_json_dict(_{error:method_not_allowed}, [status(405)]), Status = 405
    ),
    log_request(Actual, Request, Status, Start).

% Uma linha por pedido em user_error, que o Docker mostra em `docker compose logs`.
log_request(Method, Request, Status, Start) :-
    memberchk(request_uri(Uri), Request),
    upcase_atom(Method, Upper),
    get_time(Now),
    Ms is round((Now - Start) * 1000),
    format(user_error, '~w ~w -> ~w (~d ms)~n', [Upper, Uri, Status, Ms]).

% api_error(+Erro, -Status): responde ao cliente e devolve o código HTTP.
api_error(api_error(Status, Message), Status) :- !,
    reply_json_dict(_{error:Message}, [status(Status)]).
api_error(error(existence_error(http_parameter, Name), _), 400) :- !,
    format(atom(Message), 'Parâmetro obrigatório: ~w', [Name]),
    reply_json_dict(_{error:Message}, [status(400)]).
api_error(error(Formal, _), 400) :-
    ( Formal = type_error(_, _) ; Formal = domain_error(_, _) ), !,
    reply_json_dict(_{error:'Parâmetro inválido'}, [status(400)]).
api_error(Error, 500) :-
    print_message(error, Error),
    reply_json_dict(_{error:internal_server_error}, [status(500)]).

valid_page(Limit, Offset) :-
    ( between(1,100,Limit), Offset >= 0 -> true
    ; throw(api_error(400, 'limit: 1 a 100; offset: maior ou igual a 0')) ).

page(List, Offset, Limit, Page) :-
    findall(X, (nth0(Index,List,X), Index >= Offset, Index < Offset+Limit), Page).

% Controller: recarregar os CSV de filmes e/ou utilizadores sem reiniciar.
:- module(reload_controller, []).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(http_common).

:- http_handler(root(api/reload),        api_handle(post, reload(all)),    []).
:- http_handler(root(api/reload/users),  api_handle(post, reload(users)),  []).
:- http_handler(root(api/reload/movies), api_handle(post, reload(movies)), []).

reload(Scope, _Request) :-
    catch(recarrega_base(Scope), error(domain_error(What, Value), _),
          invalid_csv(What, Value)),
    aggregate_all(count, facto(_, movie(_, _)), Movies),
    aggregate_all(count, user_fact(user(_)), Users),
    reply_json_dict(_{status:ok, reloaded:Scope, movies:Movies, users:Users}).

% CSV inválido: a base em memória fica como estava antes do pedido.
invalid_csv(What, Value) :-
    format(atom(Message), 'CSV inválido: ~q ~q', [What, Value]),
    throw(api_error(422, Message)).

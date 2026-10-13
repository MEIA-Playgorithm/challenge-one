% Controller: estado do serviço.
:- module(health_controller, []).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(http_common).

:- http_handler(root(api/health), api_handle(get, health), []).

health(_) :- reply_json_dict(_{status:ok}).

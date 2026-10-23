% Ponto de entrada da API: carrega a base de conhecimento, regista os
% controllers (cada um declara os seus http_handler) e arranca o servidor.
:- module(server, [start/0, start/1, stop/0]).
:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).

% Motor, filmes e regras vivem no módulo user, partilhado pelos controllers.
:- user:ensure_loaded('../sp_exp2.pl').
:- user:ensure_loaded('../filmes_bc.pl').
:- user:ensure_loaded('../rules_users.pl').

:- use_module(health_controller).
:- use_module(movies_controller).
:- use_module(users_controller).
:- use_module(reload_controller).
:- use_module(dialogue_controller).

:- dynamic server_port/1.

start :- start(8080).
start(Port) :-
    with_mutex(movie_api_start, start_locked(Port)).
start_locked(Port) :-
    ( server_port(Port) -> true
    ; server_port(_) -> throw(error(permission_error(start, server, Port), _))
    ; recarrega_base(all),
      http_server(http_dispatch, [port(Port)]),
      assertz(server_port(Port)),
      format(user_error, 'API a escutar na porta ~w~n', [Port]) ).
stop :- forall(retract(server_port(Port)), http_stop_server(Port, [])).

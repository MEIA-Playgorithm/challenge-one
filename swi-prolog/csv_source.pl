% Lê um CSV de um URL (http://...) ou de um ficheiro local.
:- module(csv_source, [read_csv/3]).
:- use_module(library(csv)).
:- use_module(library(http/http_open)).

read_csv(Source, Rows, Options) :-
    (   sub_atom(Source, 0, _, _, 'http://')
    ;   sub_atom(Source, 0, _, _, 'https://')
    ),
    !,
    setup_call_cleanup(http_open(Source, In, []),
                       csv_read_stream(In, Rows, Options),
                       close(In)).
read_csv(Source, Rows, Options) :-
    csv_read_file(Source, Rows, Options).

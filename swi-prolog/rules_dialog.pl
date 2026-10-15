:- discontiguous perguntavel/1, texto_pergunta/2.
:- multifile regra/1, perguntavel/1.
:- multifile texto_pergunta/2.

perguntavel(procura_historia_emocional(_)).

perguntavel(prefere_temas_realistas(_)).

perguntavel(aceita_final_triste(_)).

texto_pergunta(procura_historia_emocional(U), Texto) :-
    format(atom(Texto),
           '~w, apetece-te uma história que te emocione?', [U]).

texto_pergunta(prefere_temas_realistas(U), Texto) :-
    format(atom(Texto),
           '~w, preferes uma história sobre situações da vida real?', [U]).

texto_pergunta(aceita_final_triste(U), Texto) :-
    format(atom(Texto),
           '~w, estás disposto a ver um filme com um final triste?', [U]).


regra dialogo_1
    se [
        user(U)
        e utilizador_atual(U)
        e procura_historia_emocional(U)
        ]
    entao [cria_facto(perfil_sessao(U, emocional))].

regra dialogo_2
    se [perfil_sessao(U, emocional)
        e prefere_temas_realistas(U)]
    entao [cria_facto(sugerir_genero(U, 'Drama'))].

regra dialogo_3
    se [sugerir_genero(U, 'Drama')
        e aceita_final_triste(U)]
    entao [cria_facto(sugerir_tom(U, triste))].
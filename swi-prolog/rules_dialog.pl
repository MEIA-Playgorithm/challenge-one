:- discontiguous perguntavel/1, texto_pergunta/2.
:- multifile regra/1, perguntavel/1.
:- multifile texto_pergunta/2, opcoes_pergunta/2.

% A escolha fica na memória de trabalho e seleciona um único ramo.
opcoes_pergunta(experiencia(_),
    [emocao, comedia, acao, misterio, terror, ficcao_cientifica, fantasia]).

texto_pergunta(experiencia(U), Texto) :-
    format(atom(Texto),
           '~w, que experiência te apetece ter com o filme de hoje?', [U]).

regra dialogo_experiencia
    se [user(U)
        e utilizador_atual(U)
        e escolha(experiencia(U), Experiencia)]
    entao [cria_facto(experiencia_sessao(U, Experiencia))].

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
        e experiencia_sessao(U, emocao)
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

perguntavel(prefere_romance_com_humor(_)).

texto_pergunta(prefere_romance_com_humor(U), Texto) :-
    format(atom(Texto), '~w, preferes humor ligado a uma história romântica?', [U]).

regra dialogo_comedia_1
    se [experiencia_sessao(U, comedia)]
    entao [cria_facto(sugerir_genero(U, 'Comedy'))].

regra dialogo_comedia_2
    se [experiencia_sessao(U, comedia)
        e prefere_romance_com_humor(U)]
    entao [cria_facto(sugerir_genero(U, 'Romantic Comedy'))].

perguntavel(procura_aventura(_)).

texto_pergunta(procura_aventura(U), Texto) :-
    format(atom(Texto), '~w, gostavas de acompanhar uma aventura?', [U]).

regra dialogo_acao_1
    se [experiencia_sessao(U, acao)]
    entao [cria_facto(sugerir_genero(U, 'Action'))].

regra dialogo_acao_2
    se [experiencia_sessao(U, acao)
        e procura_aventura(U)]
    entao [cria_facto(sugerir_genero(U, 'Adventure'))].

perguntavel(procura_suspense(_)).

texto_pergunta(procura_suspense(U), Texto) :-
    format(atom(Texto), '~w, queres uma história com suspense e tensão?', [U]).

regra dialogo_misterio_1
    se [experiencia_sessao(U, misterio)]
    entao [cria_facto(sugerir_genero(U, 'Mystery'))].

regra dialogo_misterio_2
    se [experiencia_sessao(U, misterio)
        e procura_suspense(U)]
    entao [cria_facto(sugerir_genero(U, 'Thriller'))].

perguntavel(prefere_sobrenatural(_)).

texto_pergunta(prefere_sobrenatural(U), Texto) :-
    format(atom(Texto), '~w, preferes elementos sobrenaturais?', [U]).

regra dialogo_terror_1
    se [experiencia_sessao(U, terror)]
    entao [cria_facto(sugerir_genero(U, 'Horror'))].

regra dialogo_terror_2
    se [experiencia_sessao(U, terror)
        e prefere_sobrenatural(U)]
    entao [cria_facto(preferencia_sessao(U, sobrenatural))].

perguntavel(prefere_sociedade_tecnologica(_)).

texto_pergunta(prefere_sociedade_tecnologica(U), Texto) :-
    format(atom(Texto), '~w, interessam-te sociedades dominadas pela tecnologia?', [U]).

regra dialogo_ficcao_cientifica_1
    se [experiencia_sessao(U, ficcao_cientifica)]
    entao [cria_facto(sugerir_genero(U, 'SciFi'))].

regra dialogo_ficcao_cientifica_2
    se [experiencia_sessao(U, ficcao_cientifica)
        e prefere_sociedade_tecnologica(U)]
    entao [cria_facto(sugerir_genero(U, 'Cyberpunk'))].

perguntavel(procura_jornada(_)).

texto_pergunta(procura_jornada(U), Texto) :-
    format(atom(Texto), '~w, gostavas de acompanhar uma missão ou uma jornada?', [U]).

regra dialogo_fantasia_1
    se [experiencia_sessao(U, fantasia)]
    entao [cria_facto(sugerir_genero(U, 'Fantasy'))].

regra dialogo_fantasia_2
    se [experiencia_sessao(U, fantasia)
        e procura_jornada(U)]
    entao [cria_facto(sugerir_genero(U, 'Quest'))].

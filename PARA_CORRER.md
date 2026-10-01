# Para tomar conhecimento

## Esta base de conhecimento experimental está feita com 100 filmes

Compatível com `sp_exp1.pl` e `sp_exp2.pl`. Carrega como factos (devidamente inpendentizados onde é possivel partir) do ficheiro knowledge_base_movies.csv:

Id, Title, Vote, Year, Duration, RatingMPA, RatingIMDB, Budget, Director, Writer, Star, Genre, Country, FilmingLocation, Company, Language, Win, Nomination, Oscar

Os inquéritos em `knowledge_base_users.csv` são carregados por `user_bc.pl` e interpretados por `rules_users.pl`. Ver o formato e o endpoint personalizado em [api/README.md](api/README.md#inquéritos-e-recomendações-por-utilizador).

## Carregar

```bash
swipl sp_exp1.pl
```

No promt do prolog

```prolog
?- carrega_bc.
# quando pedir nome da base de conhecimento
?- 'filmes_bc.pl'.
true

?- arranca_motor.

# dá cerca de 28000 factos sobre os movies
```

## depois pode ser interrogada com

```prolog
# saber os géneros de um filme
facto(_, genre(tt0372784, Genre)).

# encontrar filmes de ritmo rápido e pouca violência
facto(_, pace(Id, fast)),
facto(_, violence(Id, low)),
facto(_, movie(Id, Title)).

# consultar temas ou intensidade psicológica
facto(_, themes(Id, Theme)).
facto(_, psychological_intensity(Id, high)).

# encontrar filmes semelhantes a um filme
facto(_, similar_movie(tt0372784, Outro)),
facto(_, movie(Outro, Title)).

# obter recomendações com pontuação de similaridade de pelo menos 7
facto(_, similarity_score(tt0372784, Outro, Score)),
Score >= 7,
facto(_, movie(Outro, Title)).

# perceber qual a regra que originou uma conclusão
facto(N, pace(tt0372784, fast)),
justifica(N, Regra, FactosOrigem).

# listar todos os filmes de ação de uma vez
findall(Title,
        (facto(_, genre(Id, 'Action')), facto(_, movie(Id, Title))),
        Filmes).


# recomendar um filme
facto(_, similarity_score(tt0372784, Id, Score)),
Score >= 7,
facto(_, movie(Id, Title)).

---
# obter apenas o filme com maior pontuação
setof(Score-Id-Title,
      (facto(_, similarity_score(tt0372784, Id, Score)),
       facto(_, movie(Id, Title))),
      Lista),
last(Lista, Pontuacao-Filme-Titulo).

---
# recomendar por preferências, por exemplo, ação com ritmo rápido
facto(_, genre(Id, 'Action')),
facto(_, pace(Id, fast)),
facto(_, movie(Id, Title)).

---

facto(_, pace(tt0372784, Pace)).
facto(_, complexity(tt0372784, Complexity)).

---

facto(_, pace(Id, fast)),
facto(_, complexity(Id, low)),
facto(_, movie(Id, Title)).

```

## Usar o segundo motor e pedir explicações

Iniciar numa sessão nova, escolhendo apenas um motor:

```bash
swipl -s sp_exp2.pl
```

No prompt do Prolog:

```prolog
carrega_bc.
'filmes_bc.pl'.
arranca_motor.

% como foi concluído que este filme tem ritmo rápido?
facto(N, pace(tt0372784, fast)), como(N).

% porque não foi classificado com ritmo lento?
whynot(pace(tt0372784, slow)).
```

As consultas de filmes acima funcionam nos dois motores. A segunda versão suporta também condições `nao` nas regras e preserva as justificações.
A negação verifica ausência no momento de execução; ligar primeiro as variáveis com condições positivas. Recarregar os factos antes de recalcular após alterações nos dados; o motor não retira automaticamente conclusões anteriores.

## Para correr nos users

O ficheiro `knowledge_base_users.csv` contém 10 utilizadores fictícios: `ana`,
`bruno`, `carla`, `diogo`, `eva`, `filipe`, `ines`, `joao`, `mariana` e `tiago`.
Cada linha guarda a idade, filmes vistos, lista de desejos e preferências.
Os valores múltiplos são separados por `|`; um campo vazio não define preferência.
Os filmes são identificados pelo ID do catálogo, por exemplo `tt0870154`.

Na pasta do projeto, iniciar uma sessão com:

```bash
swipl -q -s filmes_bc.pl
```

Este comando carrega os dois CSV, as regras dos filmes e `rules_users.pl`, usando
por defeito `sp_exp1.pl`. No prompt do Prolog, executar:

```prolog
arranca_motor.
```

Se já carregaste `filmes_bc.pl` e executaste o motor na sessão atual, podes passar
diretamente às consultas. Escrever cada consulta com um ponto final; usar `;`
para pedir outra solução ou Enter para terminar a consulta.

### Consultar os dados dos utilizadores

`user_fact/1` contém os dados carregados do CSV. O carregamento da base também
os copia para `facto/2`, onde o motor consulta as premissas das regras.

```prolog
% Listar os 10 utilizadores numa única resposta.
findall(User, user_fact(user(User)), Users).

% Consultar a idade da Inês (19).
user_fact(user_age(ines, Age)).

% Géneros preferidos: Adventure, Fantasy e Comedy.
user_fact(likes_genre(ines, Genre)).

% Género rejeitado: Horror.
user_fact(dislikes_genre(ines, Genre)).

% Idiomas preferidos: English e Portuguese.
user_fact(likes_language(ines, Language)).

% Características preferidas: ritmo, temas, realizador, atores, etc.
user_fact(prefers(ines, Attribute, Value)).

% Filme visto pela Inês: Hotel Transylvania 2.
user_fact(watched(ines, Movie)), facto(_, movie(Movie, Title)).

% Filme na lista de desejos: Jungle Cruise.
user_fact(wishlist(ines, Movie)), facto(_, movie(Movie, Title)).

% Consultar a mesma preferência na base numerada usada pelo motor.
facto(N, prefers(ines, pace, fast)).
```

### Consultar as conclusões das regras

As regras 34–37 inferem exclusões, as regras 38–60 inferem motivos e respetivos
pesos, e a regra 61 identifica pares utilizador–filme com preferências
correspondentes. Estas consultas exigem que `arranca_motor` tenha terminado.

```prolog
% Motivos pelos quais Jungle Cruise corresponde às preferências da Inês.
preference_reason(ines, tt0870154, Reason, Weight).

% Verificar se há pelo menos uma preferência correspondente.
matches_preferences(ines, tt0870154).

% Listar os filmes excluídos para a Inês.
findall(Movie-Title,
        (excluded_movie(ines, Movie), facto(_, movie(Movie, Title))),
        Excluded).

% Hotel Transylvania 2 é excluído porque a Inês já o viu.
facto(N, excluded_movie(ines, tt2510894)),
justifica(N, Rule, SourceFacts).

% A regra 47 atribui 2 pontos à correspondência de ritmo rápido.
facto(N, preference_reason(ines, tt0870154, pace(fast), 2)),
justifica(N, Rule, SourceFacts).
```

`matches_preferences/2` não garante uma recomendação: um filme pode corresponder
a preferências e, ao mesmo tempo, estar excluído.

Depois de editar o CSV, reconstruir os factos e as inferências:

```prolog
carrega_factos_filmes.
arranca_motor.
```

Executar apenas `load_users` atualiza `user_fact/1`, mas não reconstrói os factos
numerados nem elimina conclusões antigas. `rules_user.pl` é apenas um ficheiro
de compatibilidade; as regras estão em `rules_users.pl`.

## Recomendações

Depois de carregar a base e executar o motor, `user_recommendation/4` devolve o
filme, a pontuação e os motivos. Exclui filmes já vistos, com géneros ou idiomas
rejeitados, ou incompatíveis com a política de idade. As restantes preferências
somam pontos; não são requisitos obrigatórios.

### Consultar recomendações para a Inês

```prolog
% Obter recomendações, uma solução de cada vez (sem ordenação por pontuação).
user_recommendation(ines, Movie, Score, Reasons),
facto(_, movie(Movie, Title)).

% Consultar apenas os IDs recomendados.
recommend(ines, Movie).

% Ver a pontuação e os motivos de um filme específico.
user_recommendation(ines, tt0870154, Score, Reasons).
```

Com os dados atuais, `Jungle Cruise` (`tt0870154`) é a melhor recomendação para a
Inês, com **55 pontos**. Corresponde, entre outros critérios, a aventura, fantasia,
comédia, ritmo rápido, humor elevado e temas de exploração e sobrenatural.
Também está na lista de desejos. A pontuação é uma soma de pesos, não uma
percentagem nem uma garantia de que o utilizador gostará do filme.

### Ordenar e escolher a melhor recomendação

A chave negativa permite ordenar por pontuação decrescente, com desempate por
ID do filme. `findall/3` devolve uma lista vazia quando não há recomendações.

```prolog
% Listar todas as recomendações por ordem de pontuação.
findall(Key-Movie-Title-Score-Reasons,
        (user_recommendation(ines, Movie, Score, Reasons),
         facto(_, movie(Movie, Title)),
         Key is -Score),
        Candidates),
sort(Candidates, Ranked).

% Obter apenas a melhor recomendação.
findall(Key-Movie-Title-Score-Reasons,
        (user_recommendation(ines, Movie, Score, Reasons),
         facto(_, movie(Movie, Title)),
         Key is -Score),
        Candidates),
sort(Candidates, [_-BestMovie-BestTitle-BestScore-BestReasons|_]).
```

A segunda consulta devolve `false` se não existir nenhum candidato.
Para consultar outro perfil, substituir `ines` por um dos IDs do CSV, por exemplo
`diogo` ou `carla`.

### Como é calculada a pontuação

Cada motivo distinto contribui com o peso definido em `rules_users.pl`:

| Correspondência | Pontos |
| --- | --- |
| Género preferido | 4 |
| Idioma preferido | 2 |
| Filme na lista de desejos | 6 |
| Realizador, ator ou subgénero preferido | 3 |
| Argumentista preferido | 2 |
| País de origem preferido | 1 |
| Ritmo, complexidade, violência, humor ou intensidade psicológica | 2 |
| Tom emocional | 2 |
| Tema | 3 |
| Público, época ou popularidade | 1 |
| Similaridade >= 7 com um filme visto | 1 no máximo pelo histórico todo |

Vários géneros ou temas correspondentes podem somar várias contribuições.
Motivos repetidos são eliminados antes da soma. O histórico indica familiaridade,
não necessariamente gosto. A pontuação final é calculada na consulta, depois das
inferências, e não guardada como um facto de recomendação.

As exclusões prevalecem sobre a pontuação e a lista de desejos. Por exemplo, o
João tem `tt0067500` na lista de desejos, mas rejeita `Horror`, género desse filme:

```prolog
excluded_movie(joao, tt0067500).
% true

recommend(joao, tt0067500).
% false
```

Para menores, a política implementada permite G/PG, permite PG-13 a partir dos
13 anos e exclui classificações ausentes ou não reconhecidas. R/NC-17 exigem 18
anos. Assim, as recomendações do Diogo, de 12 anos, também passam por esse filtro.

### Explicar uma recomendação com o segundo motor

Numa sessão nova, iniciar:

```bash
swipl -q -s sp_exp2.pl
```

Depois, no prompt do Prolog:

```prolog
carrega_bc.
'filmes_bc.pl'.
arranca_motor.

% Ver a recomendação completa e os seus motivos.
user_recommendation(ines, tt0870154, Score, Reasons).

% Explicar um dos motivos, incluindo as premissas que o originaram.
facto(N, preference_reason(ines, tt0870154, pace(fast), 2)),
como(N).

% Explicar a exclusão de um filme já visto.
facto(N, excluded_movie(ines, tt2510894)),
como(N).

% Investigar um motivo que não foi inferido.
whynot(preference_reason(ines, tt0870154, pace(slow), 2)).
```

Usar `como/1` e `whynot/1` sobre factos inferidos, como `preference_reason/4` ou
`excluded_movie/2`. `user_recommendation/4` é uma consulta auxiliar que agrega os
resultados, não uma conclusão produzida por `cria_facto`.

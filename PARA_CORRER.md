# Para tomar conhecimento

## Esta base de conhecimento experimental está feita com 100 filmes

Foi experimentada com sp_exp1.spl (apenas). Carrega como factos (devidamente inpendentizados onde é possivel partir) do ficheiro knowledge_base_movies.csv:

Id, Title, Vote, Year, Duration, RatingMPA, RatingIMDB, Budget, Director, Writer, Star, Genre, Country, FilmingLocation, Company, Language, Win, Nomination, Oscar

*(Não fiz nada (ainda) com rules_user.pl e com sp_exp2.pl)*

## Carregar

``` bash
swipl sp_exp1.pl

?- carrega_bc.
# quando pedir nome da base de conhecimento
?- 'filmes_bc.pl'.
true

?- arranca_motor.

# dá cerca de 28000 factos sobre os movies
```

## depois pode ser interrogada com

``` bash
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

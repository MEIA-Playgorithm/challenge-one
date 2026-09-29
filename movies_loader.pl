:- use_module(library(csv)).

:- dynamic movie/2.
:- dynamic year/2.
:- dynamic vote/2.
:- dynamic director/2.
:- dynamic writer/2.
:- dynamic genre/2.
:- dynamic country_origin/2.
:- dynamic production_company/2.
:- dynamic language/2.
:- dynamic duration/2.
:- dynamic rating_mpa/2.
:- dynamic rating_imdb/2.
:- dynamic budget/2.
:- dynamic star/2.
:- dynamic filming_location/2.
:- dynamic win/2.
:- dynamic nomination/2.
:- dynamic oscar/2.



load_movies :-
    retractall(movie(_, _)),
    retractall(year(_, _)),
    retractall(vote(_, _)),
    retractall(director(_, _)),
    retractall(writer(_, _)),
    retractall(genre(_, _)),
    retractall(country_origin(_, _)),
    retractall(production_company(_, _)),
    retractall(language(_, _)),
    retractall(duration(_, _)),
    retractall(rating_mpa(_, _)),
    retractall(rating_imdb(_, _)),
    retractall(budget(_, _)),
    retractall(star(_, _)),
    retractall(filming_location(_, _)),
    retractall(win(_, _)),
    retractall(nomination(_, _)),
    retractall(oscar(_, _)),

    csv_read_file(
        'knowledge_base_movies.csv',
        [_Header | Rows],
        [functor(movie_data), arity(19)]
    ),

    maplist(assert_movie, Rows).


assert_movie(Row) :-
    Row =.. [
        movie_data,
        Id,
        Title,
        Vote,
        Year,
        Duration,
        RatingMPA,
        RatingIMDB,
        Budget,
        Director,
        Writer,
        Star,
        Genre,
        Country,
        FilmingLocation,
        Company,
        Language,
        Win,
        Nomination,
        Oscar
    ],

     

    assertz(movie(Id, Title)),
    assertz(year(Id, Year)),
    assertz(vote(Id, Vote)),
    atomic_list_concat(Directors, ',', Director),
    maplist(assert_director(Id), Directors),
    atomic_list_concat(Writers, ',', Writer),
    maplist(assert_writer(Id), Writers),
    atomic_list_concat(Stars, ',', Star),
    maplist(assert_star(Id), Stars),

    atomic_list_concat(Genres, ',', Genre),
    maplist(assert_genre(Id), Genres),

    atomic_list_concat(FilmingLocations, ',', FilmingLocation),
    maplist(assert_filming_location(Id), FilmingLocations),

    atomic_list_concat(Countries, ',', Country),
    maplist(assert_country_origin(Id), Countries),
    atomic_list_concat(Companies, ',', Company),
    maplist(assert_production_company(Id), Companies),

    atomic_list_concat(Languages, ',', Language),
    maplist(assert_language(Id), Languages),

    assertz(duration(Id, Duration)),

    assertz(rating_mpa(Id, RatingMPA)),
    assertz(rating_imdb(Id, RatingIMDB)),
    assertz(budget(Id, Budget)),
    

    assertz(win(Id, Win)),
    assertz(nomination(Id, Nomination)),
    assertz(oscar(Id, Oscar)).
    


assert_director(Id, RawDirector) :-
    normalize_space(atom(Director), RawDirector),
    ( Director == '' -> true ; assertz(director(Id, Director)) ).

assert_writer(Id, RawWriter) :-
    normalize_space(atom(Writer), RawWriter),
    ( Writer == '' -> true ; assertz(writer(Id, Writer)) ).

assert_star(Id, RawStar) :-
    normalize_space(atom(Star), RawStar),
    ( Star == '' -> true ; assertz(star(Id, Star)) ).

assert_filming_location(Id, RawFilmingLocation) :-
    normalize_space(atom(FilmingLocation), RawFilmingLocation),
    ( FilmingLocation == '' -> true ; assertz(filming_location(Id, FilmingLocation)) ).

assert_country_origin(Id, RawCountry) :-
    normalize_space(atom(Country), RawCountry),
    ( Country == '' -> true ; assertz(country_origin(Id, Country)) ).

assert_production_company(Id, RawCompany) :-
    normalize_space(atom(Company), RawCompany),
    ( Company == '' -> true ; assertz(production_company(Id, Company)) ).

assert_language(Id, RawLanguage) :-
    normalize_space(atom(Language), RawLanguage),
    ( Language == '' -> true ; assertz(language(Id, Language)) ).

assert_genre(Id, RawGenre) :-
    normalize_space(atom(Genre), RawGenre),
    ( Genre == '' -> true ; assertz(genre(Id, Genre)) ).

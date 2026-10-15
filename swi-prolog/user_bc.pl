% Dados do inquérito, separados das regras. Não executa termos vindos do CSV.
:- use_module(library(csv)).
:- dynamic user_fact/1.

load_users :-
    getenv('USERS_CSV', File), File \== '', !, load_users(File).
load_users :-
    source_file(load_users, Source), file_directory_name(Source, Dir),
    directory_file_path(Dir, 'knowledge_base_users.csv', File), load_users(File).
load_users(File) :-
    csv_read_file(File, [Header|Rows], [functor(user_row), convert(false)]),
    Header =.. [user_row|Columns],
    Base = [user_id,age,watched,wishlist,preferred_genres,disliked_genres,
            preferred_languages,disliked_languages],
    ( append(Base, Extra, Columns), sort(Extra, UniqueExtra),
      same_length(Extra, UniqueExtra),
      forall(member(C, Extra), known_user_column(C))
    -> true ; throw(error(domain_error(user_csv_header,Header),_)) ),
    maplist(user_extended_row_facts(Columns), Rows, Groups), append(Groups, Facts),
    findall(Id, member(user(Id), Facts), Ids), sort(Ids, Unique),
    ( same_length(Ids, Unique) -> true ; throw(error(domain_error(unique_user_ids,Ids),_)) ),
    transaction((retractall(user_fact(_)), forall(member(F,Facts),assertz(user_fact(F))))).

user_row_facts(user_row(Id,AgeText,Watched,Wishes,Genres,Dislikes,Languages,NoLanguages), Facts) :-
    ( Id \== '', (AgeText == '' ; catch(atom_number(AgeText,Age),_,fail), integer(Age), between(0,120,Age))
    -> true ; throw(error(domain_error(user_id_and_age,Id-AgeText),_)) ),
    findall(F, (member(P-Text,[wishlist-Wishes,likes_genre-Genres,
        dislikes_genre-Dislikes,likes_language-Languages,dislikes_language-NoLanguages]),
        atomic_list_concat(Parts,'|',Text), member(Part,Parts), normalize_space(atom(V0),Part),
        V0 \== '', normalize_preference(P,V0,V), F=..[P,Id,V]), Raw),
    sort(Raw, Lists),
    ( AgeText == '' -> Identity=[user(Id)] ; Identity=[user(Id),user_age(Id,Age)] ),
    watched_facts(Id,Watched,History),
    append([Identity,Lists,History],Facts).

normalize_preference(P, 'Sci-Fi', 'SciFi') :- memberchk(P,[likes_genre,dislikes_genre]), !.
normalize_preference(_, V, V).

% Colunas opcionais: nome no CSV, atributo do filme, peso e valores permitidos.
% "any" usa os nomes exatos presentes no catálogo.
user_preference_column(preferred_directors, director, 10, any).
user_preference_column(preferred_writers, writer, 2, any).
user_preference_column(preferred_stars, star, 10, any).
user_preference_column(preferred_countries, country_origin, 1, any).
user_preference_column(preferred_subgenres, subgenre, 3, any).
user_preference_column(preferred_pace, pace, 2, [slow,medium,fast]).
user_preference_column(preferred_complexity, complexity, 2, [low,medium,high]).
user_preference_column(preferred_violence, violence, 2, [low,medium,high]).
user_preference_column(preferred_humor, humor, 2, [low,medium,high]).
user_preference_column(preferred_psychological_intensity, psychological_intensity, 2, [low,medium,high]).
user_preference_column(preferred_emotional_tones, emotional_tone, 2,
    [tense,dark,sad,lighthearted,romantic,reflective,exciting]).
user_preference_column(preferred_themes, themes, 3,
    [love,family,growing_up,crime,justice,war,history,technology,supernatural,
     exploration,psychology,music,sport,life_story]).
user_preference_column(preferred_audience, audience, 1, [mainstream,niche]).
user_preference_column(preferred_eras, era, 1, [classic,modern,recent]).
user_preference_column(preferred_popularity, popularity, 1, [very_popular,popular,less_popular]).

user_extended_row_facts(Columns, Row, Facts) :-
    Row =.. [user_row|Values],
    ( same_length(Columns, Values) -> true
    ; throw(error(domain_error(user_csv_row,Row),_)) ),
    length(Base, 8), append(Base, Extra, Values),
    BaseRow =.. [user_row|Base], user_row_facts(BaseRow, BaseFacts),
    Base = [Id|_], length(BaseColumns, 8), append(BaseColumns, ExtraColumns, Columns),
    maplist(user_column_facts(Id), ExtraColumns, Extra, Groups),
    append(Groups, Raw), sort(Raw, Additional), append(BaseFacts, Additional, Facts), validate_user_limits(Id, Facts).

user_preference_facts(Id, Column, Text, Facts) :-
    user_preference_column(Column, Attribute, _, Allowed),
    atomic_list_concat(Parts, '|', Text),
    findall(V, (member(Part, Parts), normalize_space(atom(V), Part), V \== ''), Values),
    maplist(valid_user_preference(Column, Allowed), Values),
    findall(prefers(Id, Attribute, V), member(V, Values), Facts).

valid_user_preference(Column, Allowed, Value) :-
    ( Allowed == any -> true
    ; memberchk(Value, Allowed) -> true
    ; throw(error(domain_error(Column, Value),_)) ).

known_user_column(C) :- user_preference_column(C,_,_,_).
known_user_column(C) :- user_limit_column(C,_).
user_limit_column(allow_rewatch, enum([true,false])).
user_limit_column(max_duration_minutes, integer(1,1440)).
user_limit_column(year_from, integer(1800,3000)).
user_limit_column(year_to, integer(1800,3000)).
user_limit_column(required_languages, list).
user_limit_column(disliked_directors, list).
user_limit_column(disliked_stars, list).
user_limit_column(session_min_age, integer(0,120)).
user_limit_column(min_rating, number(0,10)).
user_limit_column(rating_tolerance, number(0,10)).
user_limit_column(rating_required, enum([true,false])).

user_column_facts(U,C,Text,Facts) :-
    user_preference_column(C,_,_,_), !, user_preference_facts(U,C,Text,Facts).
user_column_facts(U,C,Text,Facts) :-
    user_limit_column(C,Type), normalize_space(atom(T),Text),
    ( T == '' -> Facts=[]
    ; Type == list ->
        atomic_list_concat(Parts,'|',T),
        findall(user_limit(U,C,V),
            (member(P,Parts),normalize_space(atom(V),P),V \== ''),Facts)
    ; ( valid_limit_value(Type,T,V) -> Facts=[user_limit(U,C,V)]
      ; throw(error(domain_error(C,T),_)) ) ).
valid_limit_value(integer(L,H),T,V) :- catch(atom_number(T,V),_,fail), integer(V), between(L,H,V).
valid_limit_value(number(L,H),T,V) :- catch(atom_number(T,V),_,fail), number(V), V>=L, V=<H.
valid_limit_value(enum(Allowed),V,V) :- memberchk(V,Allowed).
validate_user_limits(U,Facts) :-
    ( member(user_limit(U,year_from,L),Facts),member(user_limit(U,year_to,H),Facts),L>H
    -> throw(error(domain_error(year_interval,L-H),_)) ; true ),
    ( (member(user_limit(U,rating_tolerance,_),Facts);member(user_limit(U,rating_required,_),Facts)),
      \+ member(user_limit(U,min_rating,_),Facts)
    -> throw(error(domain_error(rating_options_without_minimum,U),_)) ; true ).

% Histórico: filme=nota, separado por |. IDs antigos sem nota equivalem a 0.
watched_facts(U,Text,Facts) :-
    atomic_list_concat(Parts,'|',Text),
    findall(P,(member(Raw,Parts),normalize_space(atom(P),Raw),P \== ''),Entries),
    maplist(watched_entry,Entries,Pairs),
    findall(M,member(M-_,Pairs),Ids),sort(Ids,Unique),
    ( same_length(Ids,Unique) -> true
    ; throw(error(domain_error(unique_watched_movies,Ids),_)) ),
    findall(F,(member(M-R,Pairs),member(F,[watched(U,M),user_movie_rating(U,M,R)])),Facts).
watched_entry(Text,Movie-Rating) :-
    atomic_list_concat(Parts,'=',Text),
    ( Parts=[RawMovie] -> normalize_space(atom(Movie),RawMovie),Rating=0
    ; Parts=[RawMovie,RawRating],normalize_space(atom(Movie),RawMovie),
      normalize_space(atom(RatingText),RawRating),
      catch(atom_number(RatingText,Rating),_,fail),integer(Rating),between(0,5,Rating)
    ), Movie \== '', !.
watched_entry(Text,_) :- throw(error(domain_error(watched_movie_rating,Text),_)).

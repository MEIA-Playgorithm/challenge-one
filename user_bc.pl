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
      forall(member(C, Extra), user_preference_column(C,_,_,_))
    -> true ; throw(error(domain_error(user_csv_header,Header),_)) ),
    maplist(user_extended_row_facts(Columns), Rows, Groups), append(Groups, Facts),
    findall(Id, member(user(Id), Facts), Ids), sort(Ids, Unique),
    ( same_length(Ids, Unique) -> true ; throw(error(domain_error(unique_user_ids,Ids),_)) ),
    transaction((retractall(user_fact(_)), forall(member(F,Facts),assertz(user_fact(F))))).

user_row_facts(user_row(Id,AgeText,Watched,Wishes,Genres,Dislikes,Languages,NoLanguages), Facts) :-
    ( Id \== '', catch(atom_number(AgeText,Age),_,fail), integer(Age), between(0,120,Age)
    -> true ; throw(error(domain_error(user_id_and_age,Id-AgeText),_)) ),
    findall(F, (member(P-Text,[watched-Watched,wishlist-Wishes,likes_genre-Genres,
        dislikes_genre-Dislikes,likes_language-Languages,dislikes_language-NoLanguages]),
        atomic_list_concat(Parts,'|',Text), member(Part,Parts), normalize_space(atom(V0),Part),
        V0 \== '', normalize_preference(P,V0,V), F=..[P,Id,V]), Raw),
    sort(Raw, Lists), append([user(Id),user_age(Id,Age)],Lists,Facts).

normalize_preference(P, 'Sci-Fi', 'SciFi') :- memberchk(P,[likes_genre,dislikes_genre]), !.
normalize_preference(_, V, V).

% Colunas opcionais: nome no CSV, atributo do filme, peso e valores permitidos.
% "any" usa os nomes exatos presentes no catálogo.
user_preference_column(preferred_directors, director, 3, any).
user_preference_column(preferred_writers, writer, 2, any).
user_preference_column(preferred_stars, star, 3, any).
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
    maplist(user_preference_facts(Id), ExtraColumns, Extra, Groups),
    append(Groups, Raw), sort(Raw, Additional), append(BaseFacts, Additional, Facts).

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

% Dados do inquérito, separados das regras. Não executa termos vindos do CSV.
:- use_module(library(csv)).
:- dynamic user_fact/1.

load_users :-
    getenv('USERS_CSV', File), File \== '', !, load_users(File).
load_users :-
    source_file(load_users, Source), file_directory_name(Source, Dir),
    directory_file_path(Dir, 'knowledge_base_users.csv', File), load_users(File).
load_users(File) :-
    csv_read_file(File, [Header|Rows], [functor(user_row), arity(8), convert(false)]),
    Expected = user_row(user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages),
    ( Header == Expected -> true ; throw(error(domain_error(user_csv_header,Header),_)) ),
    maplist(user_row_facts, Rows, Groups), append(Groups, Facts),
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

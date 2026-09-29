likes_genre(user1, 'Sci-Fi').
likes_genre(user1, 'Action').
likes_language(user1, 'English').
dislikes_genre(user1, 'Romance').
dislikes_language(user1, 'French').

matches_preferences(User, Movie) :-
    likes_genre(User, Genre),
    genre(Movie, Genre).

matches_preferences(User, Movie) :-
    likes_language(User, Language),
    language(Movie, Language).

excluded_movie(User, Movie) :-
    dislikes_genre(User, Genre),
    genre(Movie, Genre).

excluded_movie(User, Movie) :-
    dislikes_language(User, Language),
    language(Movie, Language).

recommend(User, Movie) :-
    matches_preferences(User, Movie),
    \+ excluded_movie(User, Movie).
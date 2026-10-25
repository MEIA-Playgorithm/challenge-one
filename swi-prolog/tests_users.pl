:- ensure_loaded(filmes_bc).
:- ensure_loaded(rules_user).
:- use_module(library(plunit)).
:- begin_tests(users).

test(csv_lists_and_alias) :-
    user_row_facts(user_row(ana,'25','a|b','c','Sci-Fi|Action|Action','','English',''),Facts),
    assertion(member(likes_genre(ana,'SciFi'),Facts)),
    assertion(member(watched(ana,b),Facts)),
    findall(G,member(likes_genre(ana,G),Facts),Genres), length(Genres,2).
test(invalid_age, [throws(error(domain_error(user_id_and_age,_),_))]) :-
    user_row_facts(user_row(ana,'bad','','','','','',''),_).

test(recommendation, [setup(setup_user),cleanup(retractall(user:user_fact(_)))]) :-
    assertion(user_recommendation(test,tt0372784,70.6,_)),
    assertz(user:user_fact(watched(test,tt0372784))), refresh_user_inference,
    assertion(\+ recommend(test,tt0372784)),
    retractall(user:user_fact(watched(test,_))),
    assertz(user:user_fact(dislikes_genre(test,'Drama'))), refresh_user_inference,
    assertion(\+ recommend(test,tt0372784)).

test(age, [setup(setup_user),cleanup(retractall(user:user_fact(_)))]) :-
    retractall(user:user_fact(user_age(test,_))), assertz(user:user_fact(user_age(test,12))), refresh_user_inference,
    assertion(\+ recommend(test,tt0372784)),
    assertion(\+ age_allowed(12,missing)).

test(optional_columns) :-
    user_extended_row_facts(
        [user_id,age,watched,wishlist,preferred_genres,disliked_genres,
         preferred_languages,disliked_languages,preferred_pace,preferred_themes],
        user_row(ana,'25','','','','','','',' fast|fast ','justice|exploration'), Facts),
    assertion(member(prefers(ana,pace,fast),Facts)),
    findall(V,member(prefers(ana,pace,V),Facts),[fast]),
    assertion(member(prefers(ana,themes,justice),Facts)).

test(invalid_preference, [throws(error(domain_error(preferred_pace,turbo),_))]) :-
    user_preference_facts(ana,preferred_pace,turbo,_).

test(new_recommendation_reasons,
     [setup(setup_extended_user),cleanup(cleanup_extended_user)]) :-
    user_recommendation(test,tt0372784,73.6,Reasons),
    assertion(member(pace(fast),Reasons)),
    assertion(member(themes(justice),Reasons)),
    assertion(member(era(modern),Reasons)),
    assertion(member(popularity(very_popular),Reasons)),
    assertz(user:user_fact(watched(test,tt0372784))), refresh_user_inference,
    assertion(\+ recommend(test,tt0372784)).

test(missing_attribute,
     [setup(setup_user),cleanup(retractall(user:user_fact(_)))]) :-
    assertz(user:user_fact(prefers(test,pace,slow))), refresh_user_inference,
    assertion(\+ preference_reason(test,tt0372784,pace(slow),_)).

setup_extended_user :-
    setup_user,
    forall(member(A-V,[pace-fast,themes-justice,era-modern,popularity-very_popular]),
           assertz(user:user_fact(prefers(test,A,V)))),
    refresh_user_inference.
cleanup_extended_user :-
    retractall(user:user_fact(_)), retractall(user:facto(test_extra,_)).

setup_user :-
    retractall(user:user_fact(_)),
    maplist(assertz,[user:user_fact(user(test)),user:user_fact(user_age(test,25)),
        user:user_fact(likes_genre(test,'Action')),user:user_fact(wishlist(test,tt0372784))]),
    refresh_user_inference.
% Catálogo pequeno, mas inferência real de filmes e utilizadores.
refresh_user_inference :-
    findall(F, (user:predicado_filme(P), F =.. [P,tt0372784,_], user:call(F)), Movies),
    findall(F, user:user_fact(F), Users), append(Movies, Users, Facts),
    retractall(user:facto(_,_)), retractall(user:justifica(_,_,_)),
    retractall(user:ultimo_facto(_)),
    user:numera_factos_filmes(Facts,0,Last), assertz(user:ultimo_facto(Last)),
    setup_call_cleanup(open_null_stream(S), with_output_to(S,user:arranca_motor), close(S)).

test(user_provenance, [setup(setup_extended_user),cleanup(cleanup_extended_user)]) :-
    once(user:facto(N,preference_reason(test,tt0372784,pace(fast),2))),
    user:justifica(N,47,Evidence),
    once(user:facto(P,prefers(test,pace,fast))),
    once(user:facto(M,pace(tt0372784,fast))),
    assertion(memberchk(P,Evidence)), assertion(memberchk(M,Evidence)),
    assertion(user:facto(_,matches_preferences(test,tt0372784))),
    user:ultimo_facto(Before),
    setup_call_cleanup(open_null_stream(S), with_output_to(S,user:arranca_motor), close(S)),
    user:ultimo_facto(After), assertion(Before == After).

:- end_tests(users).

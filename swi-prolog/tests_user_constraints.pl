:- ensure_loaded(filmes_bc).
:- use_module(library(plunit)).
:- begin_tests(user_constraints, [cleanup(carrega_factos_filmes)]).

fixture(Limits, Movies) :-
    retractall(user:facto(_,_)),retractall(user:ultimo_facto(_)),retractall(user:justifica(_,_,_)),
    append([user(u),user_age(u,30),likes_genre(u,'Action')|Limits],Movies,Facts),
    user:numera_factos_filmes(Facts,0,N),assertz(user:ultimo_facto(N)),
    setup_call_cleanup(open_null_stream(S),with_output_to(S,user:arranca_motor),close(S)).
film([movie(m,'M'),genre(m,'Action'),duration(m,'2h 30m'),year(m,2010),
      rating_imdb(m,'7,5'),rating_mpa(m,'PG-13'),language(m,'English'),
      director(m,'Director'),star(m,'Actor')]).
setup_limits(L) :- film(M),fixture(L,M).

test(duration_parser) :-
    forall(member(Text-N,['2h 30m'-150,'2h'-120,'90m'-90,' 1h 5m '-65]),
           assertion(duration_minutes(Text,N))),
    assertion(\+ duration_minutes('',_)),assertion(\+ duration_minutes('1h 70m',_)).
test(inclusive_boundaries) :-
    setup_limits([user_limit(u,max_duration_minutes,150),user_limit(u,year_from,2010),
                  user_limit(u,year_to,2010),user_limit(u,min_rating,7.5),
                  user_limit(u,required_languages,'English')]),
    assertion(recommend(u,m)),assertion(recommendation_status(u,m,main)).
test(each_hard_limit) :-
    forall(member(C-V,[max_duration_minutes-149,year_from-2011,year_to-2009,
                      required_languages-'Portuguese',disliked_directors-'Director',
                      disliked_stars-'Actor',session_min_age-8]),
       (setup_limits([wishlist(u,m),user_limit(u,C,V)]),assertion(excluded_movie(u,m)),
        assertion(\+ recommend(u,m)))).
test(language_alternatives) :-
    setup_limits([user_limit(u,required_languages,'English'),user_limit(u,required_languages,'Portuguese')]),
    assertion(recommend(u,m)).
test(session_overrides_account) :-
    setup_limits([user_limit(u,session_min_age,8)]),
    assertion(user:facto(_,exclusion_reason(u,m,audience_age(8)))).
test(tolerance_boundary_and_explanation) :-
    setup_limits([user_limit(u,min_rating,8),user_limit(u,rating_tolerance,0.5)]),
    recommendation_explanation(u,m,alternative,Checks,Unmet),
    assertion(member(rating(7.5,8,0.5),Checks)),
    assertion(member(rating_below_target(7.5,8),Unmet)).
test(below_tolerance) :-
    setup_limits([user_limit(u,min_rating,8),user_limit(u,rating_tolerance,0.4)]),
    assertion(\+ recommend(u,m)).
test(required_rating_ignores_tolerance) :-
    setup_limits([user_limit(u,min_rating,8),user_limit(u,rating_tolerance,1),user_limit(u,rating_required,true)]),
    assertion(\+ recommend(u,m)).
test(missing_data) :-
    forall(member(C-V,[max_duration_minutes-150,year_from-2010,year_to-2020,
                      required_languages-'English',min_rating-7,session_min_age-8]),
      (fixture([user_limit(u,C,V)],[movie(m,'M'),genre(m,'Action')]),
       assertion(\+ recommend(u,m)))).
test(no_limits_missing_data) :-
    fixture([],[movie(m,'M')]),assertion(user_recommendation(u,m,0,_)).
test(unmet_soft_preference) :-
    setup_limits([prefers(u,star,'Someone else')]),
    recommendation_explanation(u,m,main,_,Unmet),assertion(member(star('Someone else'),Unmet)).
test(priority_and_caps) :-
    setup_limits([]),
    recommendation_score(m,[genre(a)-40,genre(b)-40,director(a)-10,director(b)-10,
                            star(a)-10,star(b)-10,wishlist-6,pace(fast)-2,humor(high)-2],Score),
    assertion(Score=:=91.5),
    recommendation_key(u,m,10,Main),
    assertz(user:facto(test,user_limit(u,min_rating,8))),
    recommendation_key(u,m,99,Alternative),assertion(Main @< Alternative).
test(invalid_limit, [throws(error(domain_error(max_duration_minutes,_),_))]) :-
    user_column_facts(u,max_duration_minutes,'-2',_).
test(inverted_years,[throws(error(domain_error(year_interval,_),_))]) :-
    validate_user_limits(u,[user_limit(u,year_from,2020),user_limit(u,year_to,2010)]).
test(orphan_tolerance,[throws(error(domain_error(rating_options_without_minimum,_),_))]) :-
    validate_user_limits(u,[user_limit(u,rating_tolerance,0.5)]).
test(csv_validation_is_atomic) :-
    setup_call_cleanup(tmp_file_stream(text,File,Stream),
      ( format(Stream,'user_id,age,watched,wishlist,preferred_genres,disliked_genres,preferred_languages,disliked_languages,year_from,year_to~n',[]),
        format(Stream,'invalid,30,,,,,,,2020,2010~n',[]),close(Stream),
        findall(F,user:user_fact(F),Before),
        catch(load_users(File),error(domain_error(year_interval,_),_),Caught=true),
        assertion(Caught==true),findall(F,user:user_fact(F),After),assertion(Before==After) ),
      (catch(close(Stream),_,true),delete_file(File))).
test(exclusion_evidence) :-
    setup_limits([user_limit(u,max_duration_minutes,149)]),
    once(user:facto(N,exclusion_reason(u,m,duration_limit(149)))),
    user:justifica(N,64,Evidence),
    once(user:facto(L,user_limit(u,max_duration_minutes,149))),
    once(user:facto(D,duration(m,'2h 30m'))),
    assertion(memberchk(L,Evidence)),assertion(memberchk(D,Evidence)).
test(optional_age) :-
    user_row_facts(user_row(u,'','','','','','',''),Facts),assertion(Facts==[user(u)]).
test(new_columns) :-
    user_extended_row_facts([user_id,age,watched,wishlist,preferred_genres,disliked_genres,
      preferred_languages,disliked_languages,max_duration_minutes,session_min_age,min_rating,
      rating_tolerance,rating_required,required_languages],
      user_row(u,'','','','','','','','150','8','8','0.5',false,'English|Portuguese'),Facts),
    assertion(member(user_limit(u,session_min_age,8),Facts)),
    assertion(member(user_limit(u,rating_tolerance,0.5),Facts)).
test(watched_excluded_by_default) :-
    setup_limits([watched(u,m)]),assertion(\+ recommend(u,m)).
test(rewatch_explicitly_enabled) :-
    setup_limits([watched(u,m),user_limit(u,allow_rewatch,true)]),assertion(recommend(u,m)).
test(rewatch_does_not_override_constraints) :-
    setup_limits([watched(u,m),user_limit(u,allow_rewatch,true),user_limit(u,max_duration_minutes,100)]),
    assertion(\+ recommend(u,m)).
test(watched_is_not_liked) :-
    film(M),append(M,[similarity_score(reference,m,8)],Movies),
    fixture([watched(u,reference)],Movies),
    assertion(\+ preference_reason(u,m,liked_similarity(_),_)).
test(explicit_likes_drive_similarity) :-
    film(M),append(M,[similarity_score(reference,m,8),similarity_score(other,m,9)],Movies),
    fixture([user_movie_rating(u,reference,4),user_movie_rating(u,other,5)],Movies),
    assertion(preference_reason(u,m,liked_similarity(reference),1)),
    assertion(preference_reason(u,m,liked_similarity(other),1)),
    score_breakdown(u,m,Breakdown),assertion(Breakdown.secondary=:=1).
test(new_feedback_columns) :-
    watched_facts(u,'tt1=4|tt2=0',Facts),
    assertion(member(user_movie_rating(u,tt1,4),Facts)),
    assertion(member(user_movie_rating(u,tt2,0),Facts)),
    user_column_facts(u,allow_rewatch,true,[user_limit(u,allow_rewatch,true)]).
test(rated_history) :-
    watched_facts(u,' a = 5 | b=0 | c ',Facts),
    assertion(member(watched(u,a),Facts)),assertion(member(user_movie_rating(u,a,5),Facts)),
    assertion(member(user_movie_rating(u,b,0),Facts)),assertion(member(user_movie_rating(u,c,0),Facts)).
test(invalid_ratings) :-
    forall(member(Text,['a=6','a= -1','a=2.5','a=bad','a=','=3','a=1=2']),
      (catch(watched_facts(u,Text,_),error(domain_error(watched_movie_rating,_),_),Caught=true),
       assertion(Caught==true))).
test(duplicate_ratings,[throws(error(domain_error(unique_watched_movies,_),_))]) :-
    watched_facts(u,'a=1|a=5',_).
test(low_and_unrated_not_positive) :-
    forall(between(0,3,Rating),
      (film(M),append(M,[similarity_score(reference,m,8)],Movies),
       fixture([watched(u,reference),user_movie_rating(u,reference,Rating)],Movies),
       assertion(\+ preference_reason(u,m,liked_similarity(_),_)))).
test(rating_provenance) :-
    film(M),append(M,[similarity_score(reference,m,8)],Movies),
    fixture([watched(u,reference),user_movie_rating(u,reference,4)],Movies),
    once(user:facto(N,preference_reason(u,m,liked_similarity(reference),1))),
    user:justifica(N,41,Evidence),once(user:facto(R,user_movie_rating(u,reference,4))),
    assertion(memberchk(R,Evidence)).
:- end_tests(user_constraints).

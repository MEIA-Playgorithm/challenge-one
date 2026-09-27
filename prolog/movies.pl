% ============================================================
% movies.pl
% Movie Recommendation Expert System
% Raw / Direct Movie Knowledge Base
% ============================================================
%
% This file contains ONLY raw/direct movie facts.
%
% Derived and expert-inferred properties such as:
%   decade, subgenre, themes, supernatural_content, realism,
%   humor_level, mainstream_vs_niche, pace, complexity,
%   psychological_intensity, emotional_tone, violence_level,
%   gore_level and character_archetype
% belong in the inference layer.
%
% Dynamic API fields:
%   popularity/2, vote_count/2 and trending_status/2
% are represented as predicates but intentionally left as unknown
% until an API/import pipeline is connected.
%
% ============================================================

% ------------------------------------------------------------
% Scream
% ------------------------------------------------------------
movie(scream).
title(scream, 'Scream').
runtime(scream, 111).
release_year(scream, 1996).
age_rating(scream, r).
original_language(scream, english).
genre(scream, horror).
genre(scream, mystery).
genre(scream, thriller).
director(scream, wes_craven).
producer(scream, cathy_konrad).
producer(scream, cary_woods).
writer(scream, kevin_williamson).
actor(scream, neve_campbell).
actor(scream, courteney_cox).
actor(scream, david_arquette).
actor(scream, skeet_ulrich).
actor(scream, matthew_lillard).
character(scream, sidney_prescott).
character(scream, gale_weathers).
character(scream, dewey_riley).
character(scream, ghostface).
keyword(scream, masked_killer).
keyword(scream, serial_killer).
keyword(scream, final_girl).
keyword(scream, high_school).
keyword(scream, murder).
keyword(scream, stalking).
keyword(scream, meta_horror).
popularity(scream, unknown).
vote_count(scream, unknown).
trending_status(scream, unknown).

% ------------------------------------------------------------
% Halloween
% ------------------------------------------------------------
movie(halloween).
title(halloween, 'Halloween').
runtime(halloween, 91).
release_year(halloween, 1978).
age_rating(halloween, r).
original_language(halloween, english).
genre(halloween, horror).
genre(halloween, thriller).
director(halloween, john_carpenter).
producer(halloween, debra_hill).
writer(halloween, john_carpenter).
writer(halloween, debra_hill).
actor(halloween, jamie_lee_curtis).
actor(halloween, donald_pleasence).
actor(halloween, nick_castle).
character(halloween, laurie_strode).
character(halloween, michael_myers).
character(halloween, sam_loomis).
keyword(halloween, masked_killer).
keyword(halloween, serial_killer).
keyword(halloween, stalking).
keyword(halloween, babysitter).
keyword(halloween, final_girl).
keyword(halloween, murder).
popularity(halloween, unknown).
vote_count(halloween, unknown).
trending_status(halloween, unknown).

% ------------------------------------------------------------
% Hereditary
% ------------------------------------------------------------
movie(hereditary).
title(hereditary, 'Hereditary').
runtime(hereditary, 127).
release_year(hereditary, 2018).
age_rating(hereditary, r).
original_language(hereditary, english).
genre(hereditary, horror).
genre(hereditary, drama).
genre(hereditary, mystery).
director(hereditary, ari_aster).
producer(hereditary, kevin_frakes).
producer(hereditary, lars_knudsen).
producer(hereditary, buddy_patrick).
writer(hereditary, ari_aster).
actor(hereditary, toni_collette).
actor(hereditary, alex_wolff).
actor(hereditary, gabriel_byrne).
actor(hereditary, milly_shapiro).
character(hereditary, annie_graham).
character(hereditary, peter_graham).
character(hereditary, steve_graham).
character(hereditary, charlie_graham).
keyword(hereditary, grief).
keyword(hereditary, trauma).
keyword(hereditary, family).
keyword(hereditary, cult).
keyword(hereditary, possession).
keyword(hereditary, supernatural).
keyword(hereditary, death).
popularity(hereditary, unknown).
vote_count(hereditary, unknown).
trending_status(hereditary, unknown).

% ------------------------------------------------------------
% The Conjuring
% ------------------------------------------------------------
movie(the_conjuring).
title(the_conjuring, 'The Conjuring').
runtime(the_conjuring, 112).
release_year(the_conjuring, 2013).
age_rating(the_conjuring, r).
original_language(the_conjuring, english).
genre(the_conjuring, horror).
genre(the_conjuring, thriller).
genre(the_conjuring, mystery).
director(the_conjuring, james_wan).
producer(the_conjuring, peter_safran).
producer(the_conjuring, tony_derosa_grund).
writer(the_conjuring, chad_hayes).
writer(the_conjuring, carey_w_hayes).
actor(the_conjuring, vera_farmiga).
actor(the_conjuring, patrick_wilson).
actor(the_conjuring, lili_taylor).
actor(the_conjuring, ron_livingston).
character(the_conjuring, lorraine_warren).
character(the_conjuring, ed_warren).
character(the_conjuring, carolyn_perron).
character(the_conjuring, roger_perron).
keyword(the_conjuring, haunted_house).
keyword(the_conjuring, possession).
keyword(the_conjuring, ghost).
keyword(the_conjuring, demon).
keyword(the_conjuring, family).
keyword(the_conjuring, paranormal).
keyword(the_conjuring, exorcism).
popularity(the_conjuring, unknown).
vote_count(the_conjuring, unknown).
trending_status(the_conjuring, unknown).

% ------------------------------------------------------------
% Get Out
% ------------------------------------------------------------
movie(get_out).
title(get_out, 'Get Out').
runtime(get_out, 104).
release_year(get_out, 2017).
age_rating(get_out, r).
original_language(get_out, english).
genre(get_out, horror).
genre(get_out, thriller).
genre(get_out, mystery).
director(get_out, jordan_peele).
producer(get_out, sean_mckittrick).
producer(get_out, jason_blum).
producer(get_out, edward_h_hamm_jr).
writer(get_out, jordan_peele).
actor(get_out, daniel_kaluuya).
actor(get_out, allison_williams).
actor(get_out, bradley_whitford).
actor(get_out, catherine_keener).
character(get_out, chris_washington).
character(get_out, rose_armitage).
character(get_out, dean_armitage).
character(get_out, missy_armitage).
keyword(get_out, social_commentary).
keyword(get_out, racism).
keyword(get_out, mind_control).
keyword(get_out, conspiracy).
keyword(get_out, psychological).
keyword(get_out, mystery).
keyword(get_out, satire).
popularity(get_out, unknown).
vote_count(get_out, unknown).
trending_status(get_out, unknown).

% ------------------------------------------------------------
% John Wick
% ------------------------------------------------------------
movie(john_wick).
title(john_wick, 'John Wick').
runtime(john_wick, 101).
release_year(john_wick, 2014).
age_rating(john_wick, r).
original_language(john_wick, english).
genre(john_wick, action).
genre(john_wick, thriller).
genre(john_wick, crime).
director(john_wick, chad_stahelski).
producer(john_wick, basil_iwanyk).
producer(john_wick, david_leitch).
producer(john_wick, eva_longoria).
writer(john_wick, derek_kolstad).
actor(john_wick, keanu_reeves).
actor(john_wick, michael_nyqvist).
actor(john_wick, alfie_allen).
actor(john_wick, willem_dafoe).
character(john_wick, john_wick).
character(john_wick, viggo_tarasov).
character(john_wick, iosef_tarasov).
character(john_wick, marcus).
keyword(john_wick, assassin).
keyword(john_wick, revenge).
keyword(john_wick, gunfight).
keyword(john_wick, organized_crime).
keyword(john_wick, violence).
keyword(john_wick, dog).
keyword(john_wick, underworld).
popularity(john_wick, unknown).
vote_count(john_wick, unknown).
trending_status(john_wick, unknown).

% ------------------------------------------------------------
% Mad Max: Fury Road
% ------------------------------------------------------------
movie(mad_max_fury_road).
title(mad_max_fury_road, 'Mad Max: Fury Road').
runtime(mad_max_fury_road, 120).
release_year(mad_max_fury_road, 2015).
age_rating(mad_max_fury_road, r).
original_language(mad_max_fury_road, english).
genre(mad_max_fury_road, action).
genre(mad_max_fury_road, adventure).
genre(mad_max_fury_road, science_fiction).
director(mad_max_fury_road, george_miller).
producer(mad_max_fury_road, doug_mitchell).
producer(mad_max_fury_road, george_miller).
producer(mad_max_fury_road, pj_voeten).
writer(mad_max_fury_road, george_miller).
writer(mad_max_fury_road, brendan_mccarthy).
writer(mad_max_fury_road, nico_lathouris).
actor(mad_max_fury_road, tom_hardy).
actor(mad_max_fury_road, charlize_theron).
actor(mad_max_fury_road, nicholas_hoult).
actor(mad_max_fury_road, hugh_keays_byrne).
character(mad_max_fury_road, max_rockatansky).
character(mad_max_fury_road, imperator_furiosa).
character(mad_max_fury_road, nux).
character(mad_max_fury_road, immortan_joe).
keyword(mad_max_fury_road, post_apocalyptic).
keyword(mad_max_fury_road, car_chase).
keyword(mad_max_fury_road, survival).
keyword(mad_max_fury_road, desert).
keyword(mad_max_fury_road, rebellion).
keyword(mad_max_fury_road, dystopia).
keyword(mad_max_fury_road, high_action).
popularity(mad_max_fury_road, unknown).
vote_count(mad_max_fury_road, unknown).
trending_status(mad_max_fury_road, unknown).

% ------------------------------------------------------------
% Die Hard
% ------------------------------------------------------------
movie(die_hard).
title(die_hard, 'Die Hard').
runtime(die_hard, 132).
release_year(die_hard, 1988).
age_rating(die_hard, r).
original_language(die_hard, english).
genre(die_hard, action).
genre(die_hard, thriller).
director(die_hard, john_mctiernan).
producer(die_hard, lawrence_gordon).
producer(die_hard, joel_silver).
writer(die_hard, jeb_stuart).
writer(die_hard, steven_e_de_souza).
actor(die_hard, bruce_willis).
actor(die_hard, alan_rickman).
actor(die_hard, bonnie_bedelia).
actor(die_hard, reginald_veljohnson).
character(die_hard, john_mcclane).
character(die_hard, hans_gruber).
character(die_hard, holly_gennaro).
character(die_hard, al_powell).
keyword(die_hard, terrorist).
keyword(die_hard, hostage).
keyword(die_hard, skyscraper).
keyword(die_hard, police).
keyword(die_hard, christmas).
keyword(die_hard, gunfight).
keyword(die_hard, one_man_army).
popularity(die_hard, unknown).
vote_count(die_hard, unknown).
trending_status(die_hard, unknown).

% ------------------------------------------------------------
% Gladiator
% ------------------------------------------------------------
movie(gladiator).
title(gladiator, 'Gladiator').
runtime(gladiator, 155).
release_year(gladiator, 2000).
age_rating(gladiator, r).
original_language(gladiator, english).
genre(gladiator, action).
genre(gladiator, drama).
genre(gladiator, adventure).
genre(gladiator, historical).
director(gladiator, ridley_scott).
producer(gladiator, douglas_wick).
producer(gladiator, david_franzoni).
producer(gladiator, branko_lustig).
writer(gladiator, david_franzoni).
writer(gladiator, john_logan).
writer(gladiator, william_nicholson).
actor(gladiator, russell_crowe).
actor(gladiator, joaquin_phoenix).
actor(gladiator, connie_nielsen).
actor(gladiator, oliver_reed).
character(gladiator, maximus).
character(gladiator, commodus).
character(gladiator, lucilla).
character(gladiator, proximo).
keyword(gladiator, ancient_rome).
keyword(gladiator, revenge).
keyword(gladiator, gladiator).
keyword(gladiator, empire).
keyword(gladiator, slavery).
keyword(gladiator, arena).
keyword(gladiator, historical).
popularity(gladiator, unknown).
vote_count(gladiator, unknown).
trending_status(gladiator, unknown).

% ------------------------------------------------------------
% The Dark Knight
% ------------------------------------------------------------
movie(the_dark_knight).
title(the_dark_knight, 'The Dark Knight').
runtime(the_dark_knight, 152).
release_year(the_dark_knight, 2008).
age_rating(the_dark_knight, pg13).
original_language(the_dark_knight, english).
genre(the_dark_knight, action).
genre(the_dark_knight, crime).
genre(the_dark_knight, drama).
genre(the_dark_knight, thriller).
director(the_dark_knight, christopher_nolan).
producer(the_dark_knight, emma_thomas).
producer(the_dark_knight, charles_roven).
producer(the_dark_knight, christopher_nolan).
writer(the_dark_knight, jonathan_nolan).
writer(the_dark_knight, christopher_nolan).
writer(the_dark_knight, david_s_goyer).
actor(the_dark_knight, christian_bale).
actor(the_dark_knight, heath_ledger).
actor(the_dark_knight, aaron_eckhart).
actor(the_dark_knight, michael_caine).
character(the_dark_knight, bruce_wayne).
character(the_dark_knight, joker).
character(the_dark_knight, harvey_dent).
character(the_dark_knight, alfred_pennyworth).
keyword(the_dark_knight, vigilante).
keyword(the_dark_knight, superhero).
keyword(the_dark_knight, crime).
keyword(the_dark_knight, moral_dilemma).
keyword(the_dark_knight, chaos).
keyword(the_dark_knight, organized_crime).
keyword(the_dark_knight, masked_hero).
popularity(the_dark_knight, unknown).
vote_count(the_dark_knight, unknown).
trending_status(the_dark_knight, unknown).

% ------------------------------------------------------------
% Free Solo
% ------------------------------------------------------------
movie(free_solo).
title(free_solo, 'Free Solo').
runtime(free_solo, 100).
release_year(free_solo, 2018).
age_rating(free_solo, pg13).
original_language(free_solo, english).
genre(free_solo, documentary).
genre(free_solo, adventure).
director(free_solo, elizabeth_chai_vasarhelyi).
director(free_solo, jimmy_chin).
producer(free_solo, evan_hayes).
producer(free_solo, shannon_dill).
producer(free_solo, jimmy_chin).
producer(free_solo, elizabeth_chai_vasarhelyi).
writer(free_solo, unknown).
actor(free_solo, alex_honnold).
actor(free_solo, tommy_caldwell).
actor(free_solo, jimmy_chin).
character(free_solo, alex_honnold).
keyword(free_solo, climbing).
keyword(free_solo, mountain).
keyword(free_solo, risk).
keyword(free_solo, sports).
keyword(free_solo, nature).
keyword(free_solo, achievement).
keyword(free_solo, real_life).
popularity(free_solo, unknown).
vote_count(free_solo, unknown).
trending_status(free_solo, unknown).

% ------------------------------------------------------------
% The Social Dilemma
% ------------------------------------------------------------
movie(the_social_dilemma).
title(the_social_dilemma, 'The Social Dilemma').
runtime(the_social_dilemma, 94).
release_year(the_social_dilemma, 2020).
age_rating(the_social_dilemma, pg13).
original_language(the_social_dilemma, english).
genre(the_social_dilemma, documentary).
genre(the_social_dilemma, drama).
director(the_social_dilemma, jeff_orlowski).
producer(the_social_dilemma, larissa_rhodes).
writer(the_social_dilemma, jeff_orlowski).
writer(the_social_dilemma, davis_coombe).
writer(the_social_dilemma, vickie_curtis).
actor(the_social_dilemma, tristan_harris).
actor(the_social_dilemma, jeff_seibert).
actor(the_social_dilemma, bailey_richardson).
character(the_social_dilemma, tristan_harris).
keyword(the_social_dilemma, social_media).
keyword(the_social_dilemma, technology).
keyword(the_social_dilemma, addiction).
keyword(the_social_dilemma, privacy).
keyword(the_social_dilemma, algorithm).
keyword(the_social_dilemma, society).
keyword(the_social_dilemma, ethics).
popularity(the_social_dilemma, unknown).
vote_count(the_social_dilemma, unknown).
trending_status(the_social_dilemma, unknown).

% ------------------------------------------------------------
% My Octopus Teacher
% ------------------------------------------------------------
movie(my_octopus_teacher).
title(my_octopus_teacher, 'My Octopus Teacher').
runtime(my_octopus_teacher, 85).
release_year(my_octopus_teacher, 2020).
age_rating(my_octopus_teacher, tv_pg).
original_language(my_octopus_teacher, english).
genre(my_octopus_teacher, documentary).
director(my_octopus_teacher, pippa_ehrlich).
director(my_octopus_teacher, james_reed).
producer(my_octopus_teacher, craig_foster).
writer(my_octopus_teacher, pippa_ehrlich).
writer(my_octopus_teacher, james_reed).
actor(my_octopus_teacher, craig_foster).
character(my_octopus_teacher, craig_foster).
keyword(my_octopus_teacher, octopus).
keyword(my_octopus_teacher, ocean).
keyword(my_octopus_teacher, nature).
keyword(my_octopus_teacher, wildlife).
keyword(my_octopus_teacher, relationship).
keyword(my_octopus_teacher, personal_growth).
keyword(my_octopus_teacher, documentary).
popularity(my_octopus_teacher, unknown).
vote_count(my_octopus_teacher, unknown).
trending_status(my_octopus_teacher, unknown).

% ------------------------------------------------------------
% 13th
% ------------------------------------------------------------
movie(thirteenth).
title(thirteenth, '13th').
runtime(thirteenth, 100).
release_year(thirteenth, 2016).
age_rating(thirteenth, tv_ma).
original_language(thirteenth, english).
genre(thirteenth, documentary).
genre(thirteenth, historical).
director(thirteenth, ava_duvernay).
producer(thirteenth, spencer_averick).
producer(thirteenth, howard_barish).
writer(thirteenth, ava_duvernay).
writer(thirteenth, spencer_averick).
actor(thirteenth, michelle_alexander).
actor(thirteenth, cory_booker).
actor(thirteenth, angela_davis).
character(thirteenth, unknown).
keyword(thirteenth, history).
keyword(thirteenth, justice_system).
keyword(thirteenth, prison).
keyword(thirteenth, civil_rights).
keyword(thirteenth, race).
keyword(thirteenth, politics).
keyword(thirteenth, social_issue).
popularity(thirteenth, unknown).
vote_count(thirteenth, unknown).
trending_status(thirteenth, unknown).

% ------------------------------------------------------------
% Won't You Be My Neighbor?
% ------------------------------------------------------------
movie(wont_you_be_my_neighbor).
title(wont_you_be_my_neighbor, 'Won''t You Be My Neighbor?').
runtime(wont_you_be_my_neighbor, 94).
release_year(wont_you_be_my_neighbor, 2018).
age_rating(wont_you_be_my_neighbor, pg13).
original_language(wont_you_be_my_neighbor, english).
genre(wont_you_be_my_neighbor, documentary).
director(wont_you_be_my_neighbor, morgan_neville).
producer(wont_you_be_my_neighbor, caryn_capotosto).
producer(wont_you_be_my_neighbor, nicholas_ma).
producer(wont_you_be_my_neighbor, morgan_neville).
writer(wont_you_be_my_neighbor, unknown).
actor(wont_you_be_my_neighbor, fred_rogers).
actor(wont_you_be_my_neighbor, joanne_rogers).
character(wont_you_be_my_neighbor, fred_rogers).
keyword(wont_you_be_my_neighbor, television).
keyword(wont_you_be_my_neighbor, children).
keyword(wont_you_be_my_neighbor, kindness).
keyword(wont_you_be_my_neighbor, education).
keyword(wont_you_be_my_neighbor, biography).
keyword(wont_you_be_my_neighbor, media).
keyword(wont_you_be_my_neighbor, community).
popularity(wont_you_be_my_neighbor, unknown).
vote_count(wont_you_be_my_neighbor, unknown).
trending_status(wont_you_be_my_neighbor, unknown).

% ------------------------------------------------------------
% Superbad
% ------------------------------------------------------------
movie(superbad).
title(superbad, 'Superbad').
runtime(superbad, 113).
release_year(superbad, 2007).
age_rating(superbad, r).
original_language(superbad, english).
genre(superbad, comedy).
director(superbad, greg_mottola).
producer(superbad, judd_apatow).
producer(superbad, shauna_robertson).
writer(superbad, seth_rogen).
writer(superbad, evan_goldberg).
actor(superbad, jonah_hill).
actor(superbad, michael_cera).
actor(superbad, christopher_mintz_plasse).
actor(superbad, seth_rogen).
character(superbad, seth).
character(superbad, evan).
character(superbad, fogell).
character(superbad, officer_michaels).
keyword(superbad, teen_comedy).
keyword(superbad, friendship).
keyword(superbad, high_school).
keyword(superbad, party).
keyword(superbad, coming_of_age).
keyword(superbad, alcohol).
keyword(superbad, awkward_humor).
popularity(superbad, unknown).
vote_count(superbad, unknown).
trending_status(superbad, unknown).

% ------------------------------------------------------------
% The Hangover
% ------------------------------------------------------------
movie(the_hangover).
title(the_hangover, 'The Hangover').
runtime(the_hangover, 100).
release_year(the_hangover, 2009).
age_rating(the_hangover, r).
original_language(the_hangover, english).
genre(the_hangover, comedy).
director(the_hangover, todd_phillips).
producer(the_hangover, todd_phillips).
producer(the_hangover, daniel_goldberg).
writer(the_hangover, jon_lucas).
writer(the_hangover, scott_moore).
actor(the_hangover, bradley_cooper).
actor(the_hangover, ed_helms).
actor(the_hangover, zach_galifianakis).
actor(the_hangover, justin_bartha).
character(the_hangover, phil_wenneck).
character(the_hangover, stu_price).
character(the_hangover, alan_garner).
character(the_hangover, doug_billings).
keyword(the_hangover, las_vegas).
keyword(the_hangover, bachelor_party).
keyword(the_hangover, friendship).
keyword(the_hangover, alcohol).
keyword(the_hangover, misadventure).
keyword(the_hangover, road_trip).
keyword(the_hangover, adult_humor).
popularity(the_hangover, unknown).
vote_count(the_hangover, unknown).
trending_status(the_hangover, unknown).

% ------------------------------------------------------------
% Mean Girls
% ------------------------------------------------------------
movie(mean_girls).
title(mean_girls, 'Mean Girls').
runtime(mean_girls, 97).
release_year(mean_girls, 2004).
age_rating(mean_girls, pg13).
original_language(mean_girls, english).
genre(mean_girls, comedy).
director(mean_girls, mark_waters).
producer(mean_girls, lorne_michaels).
writer(mean_girls, tina_fey).
actor(mean_girls, lindsay_lohan).
actor(mean_girls, rachel_mcadams).
actor(mean_girls, tina_fey).
actor(mean_girls, amanda_seyfried).
character(mean_girls, cady_heron).
character(mean_girls, regina_george).
character(mean_girls, janis_ian).
character(mean_girls, karen_smith).
keyword(mean_girls, high_school).
keyword(mean_girls, teenager).
keyword(mean_girls, friendship).
keyword(mean_girls, bullying).
keyword(mean_girls, popularity).
keyword(mean_girls, satire).
keyword(mean_girls, coming_of_age).
popularity(mean_girls, unknown).
vote_count(mean_girls, unknown).
trending_status(mean_girls, unknown).

% ------------------------------------------------------------
% Groundhog Day
% ------------------------------------------------------------
movie(groundhog_day).
title(groundhog_day, 'Groundhog Day').
runtime(groundhog_day, 101).
release_year(groundhog_day, 1993).
age_rating(groundhog_day, pg).
original_language(groundhog_day, english).
genre(groundhog_day, comedy).
genre(groundhog_day, romance).
genre(groundhog_day, fantasy).
director(groundhog_day, harold_ramis).
producer(groundhog_day, trevor_albert).
producer(groundhog_day, harold_ramis).
writer(groundhog_day, danny_rubin).
writer(groundhog_day, harold_ramis).
actor(groundhog_day, bill_murray).
actor(groundhog_day, andie_macdowell).
actor(groundhog_day, chris_elliott).
character(groundhog_day, phil_connors).
character(groundhog_day, rita_hanson).
character(groundhog_day, larry).
keyword(groundhog_day, time_loop).
keyword(groundhog_day, romance).
keyword(groundhog_day, self_improvement).
keyword(groundhog_day, small_town).
keyword(groundhog_day, weather).
keyword(groundhog_day, repetition).
keyword(groundhog_day, fantasy).
popularity(groundhog_day, unknown).
vote_count(groundhog_day, unknown).
trending_status(groundhog_day, unknown).

% ------------------------------------------------------------
% The Grand Budapest Hotel
% ------------------------------------------------------------
movie(the_grand_budapest_hotel).
title(the_grand_budapest_hotel, 'The Grand Budapest Hotel').
runtime(the_grand_budapest_hotel, 99).
release_year(the_grand_budapest_hotel, 2014).
age_rating(the_grand_budapest_hotel, r).
original_language(the_grand_budapest_hotel, english).
genre(the_grand_budapest_hotel, comedy).
genre(the_grand_budapest_hotel, drama).
genre(the_grand_budapest_hotel, adventure).
director(the_grand_budapest_hotel, wes_anderson).
producer(the_grand_budapest_hotel, wes_anderson).
producer(the_grand_budapest_hotel, scott_rudin).
producer(the_grand_budapest_hotel, steven_rales).
producer(the_grand_budapest_hotel, jeremy_dawson).
writer(the_grand_budapest_hotel, wes_anderson).
actor(the_grand_budapest_hotel, ralph_fiennes).
actor(the_grand_budapest_hotel, tony_revolori).
actor(the_grand_budapest_hotel, saoirse_ronan).
actor(the_grand_budapest_hotel, adrien_brody).
character(the_grand_budapest_hotel, monsieur_gustave).
character(the_grand_budapest_hotel, zero_moustafa).
character(the_grand_budapest_hotel, agatha).
character(the_grand_budapest_hotel, dmitri).
keyword(the_grand_budapest_hotel, hotel).
keyword(the_grand_budapest_hotel, friendship).
keyword(the_grand_budapest_hotel, inheritance).
keyword(the_grand_budapest_hotel, murder).
keyword(the_grand_budapest_hotel, stylized).
keyword(the_grand_budapest_hotel, dark_comedy).
keyword(the_grand_budapest_hotel, europe).
popularity(the_grand_budapest_hotel, unknown).
vote_count(the_grand_budapest_hotel, unknown).
trending_status(the_grand_budapest_hotel, unknown).

% ------------------------------------------------------------
% Raiders of the Lost Ark
% ------------------------------------------------------------
movie(raiders_of_the_lost_ark).
title(raiders_of_the_lost_ark, 'Raiders of the Lost Ark').
runtime(raiders_of_the_lost_ark, 115).
release_year(raiders_of_the_lost_ark, 1981).
age_rating(raiders_of_the_lost_ark, pg).
original_language(raiders_of_the_lost_ark, english).
genre(raiders_of_the_lost_ark, adventure).
genre(raiders_of_the_lost_ark, action).
director(raiders_of_the_lost_ark, steven_spielberg).
producer(raiders_of_the_lost_ark, frank_marshall).
writer(raiders_of_the_lost_ark, lawrence_kasdan).
writer(raiders_of_the_lost_ark, george_lucas).
writer(raiders_of_the_lost_ark, philip_kaufman).
actor(raiders_of_the_lost_ark, harrison_ford).
actor(raiders_of_the_lost_ark, karen_allen).
actor(raiders_of_the_lost_ark, paul_freeman).
actor(raiders_of_the_lost_ark, john_rhys_davies).
character(raiders_of_the_lost_ark, indiana_jones).
character(raiders_of_the_lost_ark, marion_ravenwood).
character(raiders_of_the_lost_ark, rene_belloq).
character(raiders_of_the_lost_ark, sallah).
keyword(raiders_of_the_lost_ark, archaeology).
keyword(raiders_of_the_lost_ark, treasure).
keyword(raiders_of_the_lost_ark, nazis).
keyword(raiders_of_the_lost_ark, artifact).
keyword(raiders_of_the_lost_ark, adventure).
keyword(raiders_of_the_lost_ark, chase).
keyword(raiders_of_the_lost_ark, ancient_relic).
popularity(raiders_of_the_lost_ark, unknown).
vote_count(raiders_of_the_lost_ark, unknown).
trending_status(raiders_of_the_lost_ark, unknown).

% ------------------------------------------------------------
% Jurassic Park
% ------------------------------------------------------------
movie(jurassic_park).
title(jurassic_park, 'Jurassic Park').
runtime(jurassic_park, 127).
release_year(jurassic_park, 1993).
age_rating(jurassic_park, pg13).
original_language(jurassic_park, english).
genre(jurassic_park, adventure).
genre(jurassic_park, science_fiction).
genre(jurassic_park, thriller).
director(jurassic_park, steven_spielberg).
producer(jurassic_park, kathleen_kennedy).
producer(jurassic_park, gerald_r_molen).
writer(jurassic_park, michael_crichton).
writer(jurassic_park, david_koepp).
actor(jurassic_park, sam_neill).
actor(jurassic_park, laura_dern).
actor(jurassic_park, jeff_goldblum).
actor(jurassic_park, richard_attenborough).
character(jurassic_park, alan_grant).
character(jurassic_park, ellie_sattler).
character(jurassic_park, ian_malcolm).
character(jurassic_park, john_hammond).
keyword(jurassic_park, dinosaurs).
keyword(jurassic_park, theme_park).
keyword(jurassic_park, genetic_engineering).
keyword(jurassic_park, survival).
keyword(jurassic_park, island).
keyword(jurassic_park, science).
keyword(jurassic_park, creature).
popularity(jurassic_park, unknown).
vote_count(jurassic_park, unknown).
trending_status(jurassic_park, unknown).

% ------------------------------------------------------------
% Pirates of the Caribbean: The Curse of the Black Pearl
% ------------------------------------------------------------
movie(pirates_of_the_caribbean_curse_black_pearl).
title(pirates_of_the_caribbean_curse_black_pearl, 'Pirates of the Caribbean: The Curse of the Black Pearl').
runtime(pirates_of_the_caribbean_curse_black_pearl, 143).
release_year(pirates_of_the_caribbean_curse_black_pearl, 2003).
age_rating(pirates_of_the_caribbean_curse_black_pearl, pg13).
original_language(pirates_of_the_caribbean_curse_black_pearl, english).
genre(pirates_of_the_caribbean_curse_black_pearl, adventure).
genre(pirates_of_the_caribbean_curse_black_pearl, action).
genre(pirates_of_the_caribbean_curse_black_pearl, fantasy).
director(pirates_of_the_caribbean_curse_black_pearl, gore_verbinski).
producer(pirates_of_the_caribbean_curse_black_pearl, jerry_bruckheimer).
writer(pirates_of_the_caribbean_curse_black_pearl, ted_elliott).
writer(pirates_of_the_caribbean_curse_black_pearl, terry_rossio).
actor(pirates_of_the_caribbean_curse_black_pearl, johnny_depp).
actor(pirates_of_the_caribbean_curse_black_pearl, orlando_bloom).
actor(pirates_of_the_caribbean_curse_black_pearl, keira_knightley).
actor(pirates_of_the_caribbean_curse_black_pearl, geoffrey_rush).
character(pirates_of_the_caribbean_curse_black_pearl, jack_sparrow).
character(pirates_of_the_caribbean_curse_black_pearl, will_turner).
character(pirates_of_the_caribbean_curse_black_pearl, elizabeth_swann).
character(pirates_of_the_caribbean_curse_black_pearl, hector_barbossa).
keyword(pirates_of_the_caribbean_curse_black_pearl, pirates).
keyword(pirates_of_the_caribbean_curse_black_pearl, curse).
keyword(pirates_of_the_caribbean_curse_black_pearl, treasure).
keyword(pirates_of_the_caribbean_curse_black_pearl, sword_fight).
keyword(pirates_of_the_caribbean_curse_black_pearl, sea).
keyword(pirates_of_the_caribbean_curse_black_pearl, supernatural).
keyword(pirates_of_the_caribbean_curse_black_pearl, adventure).
popularity(pirates_of_the_caribbean_curse_black_pearl, unknown).
vote_count(pirates_of_the_caribbean_curse_black_pearl, unknown).
trending_status(pirates_of_the_caribbean_curse_black_pearl, unknown).

% ------------------------------------------------------------
% The Revenant
% ------------------------------------------------------------
movie(the_revenant).
title(the_revenant, 'The Revenant').
runtime(the_revenant, 156).
release_year(the_revenant, 2015).
age_rating(the_revenant, r).
original_language(the_revenant, english).
genre(the_revenant, adventure).
genre(the_revenant, drama).
genre(the_revenant, western).
director(the_revenant, alejandro_gonzalez_inarritu).
producer(the_revenant, steve_golin).
producer(the_revenant, alejandro_gonzalez_inarritu).
producer(the_revenant, mary_parent).
producer(the_revenant, keith_redmon).
writer(the_revenant, mark_l_smith).
writer(the_revenant, alejandro_gonzalez_inarritu).
actor(the_revenant, leonardo_dicaprio).
actor(the_revenant, tom_hardy).
actor(the_revenant, domhnall_gleeson).
actor(the_revenant, will_poulter).
character(the_revenant, hugh_glass).
character(the_revenant, john_fitzgerald).
character(the_revenant, andrew_henry).
character(the_revenant, jim_bridger).
keyword(the_revenant, survival).
keyword(the_revenant, revenge).
keyword(the_revenant, wilderness).
keyword(the_revenant, frontier).
keyword(the_revenant, bear_attack).
keyword(the_revenant, nature).
keyword(the_revenant, historical).
popularity(the_revenant, unknown).
vote_count(the_revenant, unknown).
trending_status(the_revenant, unknown).

% ------------------------------------------------------------
% Life of Pi
% ------------------------------------------------------------
movie(life_of_pi).
title(life_of_pi, 'Life of Pi').
runtime(life_of_pi, 127).
release_year(life_of_pi, 2012).
age_rating(life_of_pi, pg).
original_language(life_of_pi, english).
genre(life_of_pi, adventure).
genre(life_of_pi, drama).
genre(life_of_pi, fantasy).
director(life_of_pi, ang_lee).
producer(life_of_pi, gil_netter).
producer(life_of_pi, ang_lee).
producer(life_of_pi, david_womark).
writer(life_of_pi, david_magee).
actor(life_of_pi, suraj_sharma).
actor(life_of_pi, irrfan_khan).
actor(life_of_pi, adil_hussain).
actor(life_of_pi, tabu).
character(life_of_pi, pi_patel).
character(life_of_pi, richard_parker).
keyword(life_of_pi, survival).
keyword(life_of_pi, ocean).
keyword(life_of_pi, tiger).
keyword(life_of_pi, faith).
keyword(life_of_pi, shipwreck).
keyword(life_of_pi, storytelling).
keyword(life_of_pi, spirituality).
popularity(life_of_pi, unknown).
vote_count(life_of_pi, unknown).
trending_status(life_of_pi, unknown).

% ------------------------------------------------------------
% Interstellar
% ------------------------------------------------------------
movie(interstellar).
title(interstellar, 'Interstellar').
runtime(interstellar, 169).
release_year(interstellar, 2014).
age_rating(interstellar, pg13).
original_language(interstellar, english).
genre(interstellar, science_fiction).
genre(interstellar, drama).
genre(interstellar, adventure).
director(interstellar, christopher_nolan).
producer(interstellar, emma_thomas).
producer(interstellar, christopher_nolan).
producer(interstellar, lynda_obst).
writer(interstellar, jonathan_nolan).
writer(interstellar, christopher_nolan).
actor(interstellar, matthew_mcconaughey).
actor(interstellar, anne_hathaway).
actor(interstellar, jessica_chastain).
actor(interstellar, michael_caine).
character(interstellar, cooper).
character(interstellar, murph_cooper).
character(interstellar, amelia_brand).
character(interstellar, professor_brand).
keyword(interstellar, space).
keyword(interstellar, black_hole).
keyword(interstellar, time_dilation).
keyword(interstellar, father_daughter).
keyword(interstellar, survival).
keyword(interstellar, space_travel).
keyword(interstellar, future).
popularity(interstellar, unknown).
vote_count(interstellar, unknown).
trending_status(interstellar, unknown).

% ------------------------------------------------------------
% Arrival
% ------------------------------------------------------------
movie(arrival).
title(arrival, 'Arrival').
runtime(arrival, 116).
release_year(arrival, 2016).
age_rating(arrival, pg13).
original_language(arrival, english).
genre(arrival, science_fiction).
genre(arrival, drama).
genre(arrival, mystery).
director(arrival, denis_villeneuve).
producer(arrival, shawn_levy).
producer(arrival, dan_levine).
producer(arrival, aaron_ryder).
producer(arrival, david_linde).
writer(arrival, eric_heisserer).
actor(arrival, amy_adams).
actor(arrival, jeremy_renner).
actor(arrival, forest_whitaker).
actor(arrival, michael_stuhlbarg).
character(arrival, louise_banks).
character(arrival, ian_donnelly).
character(arrival, colonel_weber).
keyword(arrival, aliens).
keyword(arrival, language).
keyword(arrival, communication).
keyword(arrival, time).
keyword(arrival, first_contact).
keyword(arrival, linguistics).
keyword(arrival, nonlinear_narrative).
popularity(arrival, unknown).
vote_count(arrival, unknown).
trending_status(arrival, unknown).

% ------------------------------------------------------------
% Blade Runner 2049
% ------------------------------------------------------------
movie(blade_runner_2049).
title(blade_runner_2049, 'Blade Runner 2049').
runtime(blade_runner_2049, 164).
release_year(blade_runner_2049, 2017).
age_rating(blade_runner_2049, r).
original_language(blade_runner_2049, english).
genre(blade_runner_2049, science_fiction).
genre(blade_runner_2049, drama).
genre(blade_runner_2049, mystery).
genre(blade_runner_2049, thriller).
director(blade_runner_2049, denis_villeneuve).
producer(blade_runner_2049, andrew_a_kosove).
producer(blade_runner_2049, broderick_johnson).
producer(blade_runner_2049, bud_yorkin).
producer(blade_runner_2049, cynthia_sikes_yorkin).
writer(blade_runner_2049, hampton_fancher).
writer(blade_runner_2049, michael_green).
actor(blade_runner_2049, ryan_gosling).
actor(blade_runner_2049, harrison_ford).
actor(blade_runner_2049, ana_de_armas).
actor(blade_runner_2049, sylvia_hoeks).
character(blade_runner_2049, k).
character(blade_runner_2049, rick_deckard).
character(blade_runner_2049, joi).
character(blade_runner_2049, luv).
keyword(blade_runner_2049, android).
keyword(blade_runner_2049, identity).
keyword(blade_runner_2049, dystopia).
keyword(blade_runner_2049, memory).
keyword(blade_runner_2049, future).
keyword(blade_runner_2049, artificial_intelligence).
keyword(blade_runner_2049, detective).
popularity(blade_runner_2049, unknown).
vote_count(blade_runner_2049, unknown).
trending_status(blade_runner_2049, unknown).

% ------------------------------------------------------------
% The Matrix
% ------------------------------------------------------------
movie(the_matrix).
title(the_matrix, 'The Matrix').
runtime(the_matrix, 136).
release_year(the_matrix, 1999).
age_rating(the_matrix, r).
original_language(the_matrix, english).
genre(the_matrix, science_fiction).
genre(the_matrix, action).
director(the_matrix, lana_wachowski).
director(the_matrix, lilly_wachowski).
producer(the_matrix, joel_silver).
writer(the_matrix, lana_wachowski).
writer(the_matrix, lilly_wachowski).
actor(the_matrix, keanu_reeves).
actor(the_matrix, laurence_fishburne).
actor(the_matrix, carrie_anne_moss).
actor(the_matrix, hugo_weaving).
character(the_matrix, neo).
character(the_matrix, morpheus).
character(the_matrix, trinity).
character(the_matrix, agent_smith).
keyword(the_matrix, virtual_reality).
keyword(the_matrix, artificial_intelligence).
keyword(the_matrix, dystopia).
keyword(the_matrix, chosen_one).
keyword(the_matrix, philosophy).
keyword(the_matrix, rebellion).
keyword(the_matrix, simulation).
popularity(the_matrix, unknown).
vote_count(the_matrix, unknown).
trending_status(the_matrix, unknown).

% ------------------------------------------------------------
% Ex Machina
% ------------------------------------------------------------
movie(ex_machina).
title(ex_machina, 'Ex Machina').
runtime(ex_machina, 108).
release_year(ex_machina, 2014).
age_rating(ex_machina, r).
original_language(ex_machina, english).
genre(ex_machina, science_fiction).
genre(ex_machina, drama).
genre(ex_machina, thriller).
director(ex_machina, alex_garland).
producer(ex_machina, andrew_macdonald).
producer(ex_machina, allon_reich).
writer(ex_machina, alex_garland).
actor(ex_machina, domhnall_gleeson).
actor(ex_machina, alicia_vikander).
actor(ex_machina, oscar_isaac).
actor(ex_machina, sonoya_mizuno).
character(ex_machina, caleb_smith).
character(ex_machina, ava).
character(ex_machina, nathan_bateman).
character(ex_machina, kyoko).
keyword(ex_machina, artificial_intelligence).
keyword(ex_machina, robot).
keyword(ex_machina, turing_test).
keyword(ex_machina, isolation).
keyword(ex_machina, manipulation).
keyword(ex_machina, technology).
keyword(ex_machina, ethics).
popularity(ex_machina, unknown).
vote_count(ex_machina, unknown).
trending_status(ex_machina, unknown).

% ------------------------------------------------------------
% La La Land
% ------------------------------------------------------------
movie(la_la_land).
title(la_la_land, 'La La Land').
runtime(la_la_land, 128).
release_year(la_la_land, 2016).
age_rating(la_la_land, pg13).
original_language(la_la_land, english).
genre(la_la_land, romance).
genre(la_la_land, drama).
genre(la_la_land, music).
director(la_la_land, damien_chazelle).
producer(la_la_land, fred_berger).
producer(la_la_land, jordan_horowitz).
producer(la_la_land, gary_gilbert).
producer(la_la_land, marc_platt).
writer(la_la_land, damien_chazelle).
actor(la_la_land, ryan_gosling).
actor(la_la_land, emma_stone).
actor(la_la_land, john_legend).
actor(la_la_land, rosemarie_dewitt).
character(la_la_land, sebastian_wilder).
character(la_la_land, mia_dolan).
keyword(la_la_land, music).
keyword(la_la_land, hollywood).
keyword(la_la_land, dreams).
keyword(la_la_land, career).
keyword(la_la_land, romance).
keyword(la_la_land, jazz).
keyword(la_la_land, ambition).
popularity(la_la_land, unknown).
vote_count(la_la_land, unknown).
trending_status(la_la_land, unknown).

% ------------------------------------------------------------
% The Notebook
% ------------------------------------------------------------
movie(the_notebook).
title(the_notebook, 'The Notebook').
runtime(the_notebook, 123).
release_year(the_notebook, 2004).
age_rating(the_notebook, pg13).
original_language(the_notebook, english).
genre(the_notebook, romance).
genre(the_notebook, drama).
director(the_notebook, nick_cassavetes).
producer(the_notebook, lynn_harris).
producer(the_notebook, mark_johnson).
writer(the_notebook, jeremy_leven).
writer(the_notebook, jan_sardi).
actor(the_notebook, ryan_gosling).
actor(the_notebook, rachel_mcadams).
actor(the_notebook, james_garner).
actor(the_notebook, gena_rowlands).
character(the_notebook, noah_calhoun).
character(the_notebook, allie_hamilton).
keyword(the_notebook, romance).
keyword(the_notebook, memory).
keyword(the_notebook, class_difference).
keyword(the_notebook, young_love).
keyword(the_notebook, aging).
keyword(the_notebook, family).
keyword(the_notebook, relationship).
popularity(the_notebook, unknown).
vote_count(the_notebook, unknown).
trending_status(the_notebook, unknown).

% ------------------------------------------------------------
% Before Sunrise
% ------------------------------------------------------------
movie(before_sunrise).
title(before_sunrise, 'Before Sunrise').
runtime(before_sunrise, 101).
release_year(before_sunrise, 1995).
age_rating(before_sunrise, r).
original_language(before_sunrise, english).
genre(before_sunrise, romance).
genre(before_sunrise, drama).
director(before_sunrise, richard_linklater).
producer(before_sunrise, anne_walker_mcbay).
writer(before_sunrise, richard_linklater).
writer(before_sunrise, kim_krizan).
actor(before_sunrise, ethan_hawke).
actor(before_sunrise, julie_delpy).
character(before_sunrise, jesse).
character(before_sunrise, celine).
keyword(before_sunrise, conversation).
keyword(before_sunrise, travel).
keyword(before_sunrise, vienna).
keyword(before_sunrise, romance).
keyword(before_sunrise, one_night).
keyword(before_sunrise, philosophy).
keyword(before_sunrise, relationship).
popularity(before_sunrise, unknown).
vote_count(before_sunrise, unknown).
trending_status(before_sunrise, unknown).

% ------------------------------------------------------------
% About Time
% ------------------------------------------------------------
movie(about_time).
title(about_time, 'About Time').
runtime(about_time, 123).
release_year(about_time, 2013).
age_rating(about_time, r).
original_language(about_time, english).
genre(about_time, romance).
genre(about_time, comedy).
genre(about_time, fantasy).
genre(about_time, drama).
director(about_time, richard_curtis).
producer(about_time, tim_bevan).
producer(about_time, eric_fellner).
producer(about_time, nicky_kentish_barnes).
writer(about_time, richard_curtis).
actor(about_time, domhnall_gleeson).
actor(about_time, rachel_mcadams).
actor(about_time, bill_nighy).
actor(about_time, lydia_wilson).
character(about_time, tim_lake).
character(about_time, mary).
character(about_time, james_lake).
keyword(about_time, time_travel).
keyword(about_time, romance).
keyword(about_time, family).
keyword(about_time, life).
keyword(about_time, relationship).
keyword(about_time, comedy).
keyword(about_time, second_chance).
popularity(about_time, unknown).
vote_count(about_time, unknown).
trending_status(about_time, unknown).

% ------------------------------------------------------------
% Pride & Prejudice
% ------------------------------------------------------------
movie(pride_and_prejudice).
title(pride_and_prejudice, 'Pride & Prejudice').
runtime(pride_and_prejudice, 129).
release_year(pride_and_prejudice, 2005).
age_rating(pride_and_prejudice, pg).
original_language(pride_and_prejudice, english).
genre(pride_and_prejudice, romance).
genre(pride_and_prejudice, drama).
director(pride_and_prejudice, joe_wright).
producer(pride_and_prejudice, tim_bevan).
producer(pride_and_prejudice, eric_fellner).
producer(pride_and_prejudice, paul_webster).
writer(pride_and_prejudice, deborah_moggach).
actor(pride_and_prejudice, keira_knightley).
actor(pride_and_prejudice, matthew_macfadyen).
actor(pride_and_prejudice, brenda_blethyn).
actor(pride_and_prejudice, donald_sutherland).
character(pride_and_prejudice, elizabeth_bennet).
character(pride_and_prejudice, fitzwilliam_darcy).
character(pride_and_prejudice, jane_bennet).
character(pride_and_prejudice, charles_bingley).
keyword(pride_and_prejudice, romance).
keyword(pride_and_prejudice, class).
keyword(pride_and_prejudice, family).
keyword(pride_and_prejudice, marriage).
keyword(pride_and_prejudice, society).
keyword(pride_and_prejudice, period_drama).
keyword(pride_and_prejudice, literary_adaptation).
popularity(pride_and_prejudice, unknown).
vote_count(pride_and_prejudice, unknown).
trending_status(pride_and_prejudice, unknown).

% ------------------------------------------------------------
% Toy Story
% ------------------------------------------------------------
movie(toy_story).
title(toy_story, 'Toy Story').
runtime(toy_story, 81).
release_year(toy_story, 1995).
age_rating(toy_story, g).
original_language(toy_story, english).
genre(toy_story, animation).
genre(toy_story, comedy).
genre(toy_story, adventure).
genre(toy_story, family).
director(toy_story, john_lasseter).
producer(toy_story, bonnie_arnold).
producer(toy_story, ralph_guggenheim).
writer(toy_story, joss_whedon).
writer(toy_story, andrew_stanton).
writer(toy_story, joel_cohen).
writer(toy_story, alec_sokolow).
actor(toy_story, tom_hanks).
actor(toy_story, tim_allen).
actor(toy_story, don_rickles).
actor(toy_story, jim_varney).
character(toy_story, woody).
character(toy_story, buzz_lightyear).
character(toy_story, mr_potato_head).
character(toy_story, rex).
keyword(toy_story, toys).
keyword(toy_story, friendship).
keyword(toy_story, jealousy).
keyword(toy_story, adventure).
keyword(toy_story, childhood).
keyword(toy_story, family).
keyword(toy_story, computer_animation).
popularity(toy_story, unknown).
vote_count(toy_story, unknown).
trending_status(toy_story, unknown).

% ------------------------------------------------------------
% Spirited Away
% ------------------------------------------------------------
movie(spirited_away).
title(spirited_away, 'Spirited Away').
runtime(spirited_away, 125).
release_year(spirited_away, 2001).
age_rating(spirited_away, pg).
original_language(spirited_away, japanese).
genre(spirited_away, animation).
genre(spirited_away, fantasy).
genre(spirited_away, adventure).
genre(spirited_away, family).
director(spirited_away, hayao_miyazaki).
producer(spirited_away, toshio_suzuki).
writer(spirited_away, hayao_miyazaki).
actor(spirited_away, rumi_hiiragi).
actor(spirited_away, miyu_irino).
actor(spirited_away, mari_natsuki).
actor(spirited_away, takashi_naito).
character(spirited_away, chihiro).
character(spirited_away, haku).
character(spirited_away, yubaba).
character(spirited_away, no_face).
keyword(spirited_away, spirit_world).
keyword(spirited_away, coming_of_age).
keyword(spirited_away, magic).
keyword(spirited_away, family).
keyword(spirited_away, bathhouse).
keyword(spirited_away, supernatural).
keyword(spirited_away, identity).
popularity(spirited_away, unknown).
vote_count(spirited_away, unknown).
trending_status(spirited_away, unknown).

% ------------------------------------------------------------
% Ratatouille
% ------------------------------------------------------------
movie(ratatouille).
title(ratatouille, 'Ratatouille').
runtime(ratatouille, 111).
release_year(ratatouille, 2007).
age_rating(ratatouille, g).
original_language(ratatouille, english).
genre(ratatouille, animation).
genre(ratatouille, comedy).
genre(ratatouille, family).
director(ratatouille, brad_bird).
producer(ratatouille, brad_lewis).
writer(ratatouille, brad_bird).
writer(ratatouille, jan_pinkava).
writer(ratatouille, jim_capobianco).
actor(ratatouille, patton_oswalt).
actor(ratatouille, ian_holm).
actor(ratatouille, lou_romano).
actor(ratatouille, janeane_garofalo).
character(ratatouille, remy).
character(ratatouille, linguini).
character(ratatouille, colette).
character(ratatouille, anton_ego).
keyword(ratatouille, cooking).
keyword(ratatouille, paris).
keyword(ratatouille, rat).
keyword(ratatouille, dreams).
keyword(ratatouille, food).
keyword(ratatouille, friendship).
keyword(ratatouille, restaurant).
popularity(ratatouille, unknown).
vote_count(ratatouille, unknown).
trending_status(ratatouille, unknown).

% ------------------------------------------------------------
% Spider-Man: Into the Spider-Verse
% ------------------------------------------------------------
movie(spider_man_into_the_spider_verse).
title(spider_man_into_the_spider_verse, 'Spider-Man: Into the Spider-Verse').
runtime(spider_man_into_the_spider_verse, 117).
release_year(spider_man_into_the_spider_verse, 2018).
age_rating(spider_man_into_the_spider_verse, pg).
original_language(spider_man_into_the_spider_verse, english).
genre(spider_man_into_the_spider_verse, animation).
genre(spider_man_into_the_spider_verse, action).
genre(spider_man_into_the_spider_verse, adventure).
genre(spider_man_into_the_spider_verse, science_fiction).
director(spider_man_into_the_spider_verse, bob_persichetti).
director(spider_man_into_the_spider_verse, peter_ramsey).
director(spider_man_into_the_spider_verse, rodney_rothman).
producer(spider_man_into_the_spider_verse, avi_arad).
producer(spider_man_into_the_spider_verse, amy_pascal).
producer(spider_man_into_the_spider_verse, phil_lord).
producer(spider_man_into_the_spider_verse, christopher_miller).
producer(spider_man_into_the_spider_verse, christina_steinberg).
writer(spider_man_into_the_spider_verse, phil_lord).
writer(spider_man_into_the_spider_verse, rodney_rothman).
actor(spider_man_into_the_spider_verse, shameik_moore).
actor(spider_man_into_the_spider_verse, jake_johnson).
actor(spider_man_into_the_spider_verse, hailee_steinfeld).
actor(spider_man_into_the_spider_verse, mahershala_ali).
character(spider_man_into_the_spider_verse, miles_morales).
character(spider_man_into_the_spider_verse, peter_b_parker).
character(spider_man_into_the_spider_verse, gwen_stacy).
character(spider_man_into_the_spider_verse, kingpin).
keyword(spider_man_into_the_spider_verse, superhero).
keyword(spider_man_into_the_spider_verse, multiverse).
keyword(spider_man_into_the_spider_verse, coming_of_age).
keyword(spider_man_into_the_spider_verse, family).
keyword(spider_man_into_the_spider_verse, parallel_world).
keyword(spider_man_into_the_spider_verse, spider_man).
keyword(spider_man_into_the_spider_verse, identity).
popularity(spider_man_into_the_spider_verse, unknown).
vote_count(spider_man_into_the_spider_verse, unknown).
trending_status(spider_man_into_the_spider_verse, unknown).

% ------------------------------------------------------------
% WALL-E
% ------------------------------------------------------------
movie(wall_e).
title(wall_e, 'WALL-E').
runtime(wall_e, 98).
release_year(wall_e, 2008).
age_rating(wall_e, g).
original_language(wall_e, english).
genre(wall_e, animation).
genre(wall_e, science_fiction).
genre(wall_e, family).
genre(wall_e, romance).
director(wall_e, andrew_stanton).
producer(wall_e, jim_morris).
writer(wall_e, andrew_stanton).
writer(wall_e, jim_reardon).
actor(wall_e, ben_burtt).
actor(wall_e, elissa_knight).
actor(wall_e, jeff_garlin).
actor(wall_e, fred_willard).
character(wall_e, wall_e).
character(wall_e, eve).
character(wall_e, captain_mccrea).
character(wall_e, auto).
keyword(wall_e, robot).
keyword(wall_e, space).
keyword(wall_e, environment).
keyword(wall_e, love).
keyword(wall_e, future).
keyword(wall_e, consumerism).
keyword(wall_e, loneliness).
popularity(wall_e, unknown).
vote_count(wall_e, unknown).
trending_status(wall_e, unknown).

% ------------------------------------------------------------
% The Lord of the Rings: The Fellowship of the Ring
% ------------------------------------------------------------
movie(the_lord_of_the_rings_fellowship).
title(the_lord_of_the_rings_fellowship, 'The Lord of the Rings: The Fellowship of the Ring').
runtime(the_lord_of_the_rings_fellowship, 178).
release_year(the_lord_of_the_rings_fellowship, 2001).
age_rating(the_lord_of_the_rings_fellowship, pg13).
original_language(the_lord_of_the_rings_fellowship, english).
genre(the_lord_of_the_rings_fellowship, fantasy).
genre(the_lord_of_the_rings_fellowship, adventure).
genre(the_lord_of_the_rings_fellowship, action).
director(the_lord_of_the_rings_fellowship, peter_jackson).
producer(the_lord_of_the_rings_fellowship, peter_jackson).
producer(the_lord_of_the_rings_fellowship, barrie_m_osborne).
producer(the_lord_of_the_rings_fellowship, tim_sanders).
producer(the_lord_of_the_rings_fellowship, fran_walsh).
writer(the_lord_of_the_rings_fellowship, fran_walsh).
writer(the_lord_of_the_rings_fellowship, philippa_boyens).
writer(the_lord_of_the_rings_fellowship, peter_jackson).
actor(the_lord_of_the_rings_fellowship, elijah_wood).
actor(the_lord_of_the_rings_fellowship, ian_mckellen).
actor(the_lord_of_the_rings_fellowship, viggo_mortensen).
actor(the_lord_of_the_rings_fellowship, sean_astin).
character(the_lord_of_the_rings_fellowship, frodo_baggins).
character(the_lord_of_the_rings_fellowship, gandalf).
character(the_lord_of_the_rings_fellowship, aragorn).
character(the_lord_of_the_rings_fellowship, samwise_gamgee).
keyword(the_lord_of_the_rings_fellowship, quest).
keyword(the_lord_of_the_rings_fellowship, magic).
keyword(the_lord_of_the_rings_fellowship, friendship).
keyword(the_lord_of_the_rings_fellowship, evil).
keyword(the_lord_of_the_rings_fellowship, fantasy_world).
keyword(the_lord_of_the_rings_fellowship, chosen_one).
keyword(the_lord_of_the_rings_fellowship, war).
popularity(the_lord_of_the_rings_fellowship, unknown).
vote_count(the_lord_of_the_rings_fellowship, unknown).
trending_status(the_lord_of_the_rings_fellowship, unknown).

% ------------------------------------------------------------
% Harry Potter and the Prisoner of Azkaban
% ------------------------------------------------------------
movie(harry_potter_prisoner_of_azkaban).
title(harry_potter_prisoner_of_azkaban, 'Harry Potter and the Prisoner of Azkaban').
runtime(harry_potter_prisoner_of_azkaban, 142).
release_year(harry_potter_prisoner_of_azkaban, 2004).
age_rating(harry_potter_prisoner_of_azkaban, pg).
original_language(harry_potter_prisoner_of_azkaban, english).
genre(harry_potter_prisoner_of_azkaban, fantasy).
genre(harry_potter_prisoner_of_azkaban, adventure).
genre(harry_potter_prisoner_of_azkaban, family).
director(harry_potter_prisoner_of_azkaban, alfonso_cuaron).
producer(harry_potter_prisoner_of_azkaban, chris_columbus).
producer(harry_potter_prisoner_of_azkaban, david_heyman).
producer(harry_potter_prisoner_of_azkaban, mark_radcliffe).
writer(harry_potter_prisoner_of_azkaban, steve_kloves).
actor(harry_potter_prisoner_of_azkaban, daniel_radcliffe).
actor(harry_potter_prisoner_of_azkaban, rupert_grint).
actor(harry_potter_prisoner_of_azkaban, emma_watson).
actor(harry_potter_prisoner_of_azkaban, gary_oldman).
character(harry_potter_prisoner_of_azkaban, harry_potter).
character(harry_potter_prisoner_of_azkaban, ron_weasley).
character(harry_potter_prisoner_of_azkaban, hermione_granger).
character(harry_potter_prisoner_of_azkaban, sirius_black).
keyword(harry_potter_prisoner_of_azkaban, magic).
keyword(harry_potter_prisoner_of_azkaban, wizard).
keyword(harry_potter_prisoner_of_azkaban, school).
keyword(harry_potter_prisoner_of_azkaban, time_travel).
keyword(harry_potter_prisoner_of_azkaban, friendship).
keyword(harry_potter_prisoner_of_azkaban, werewolf).
keyword(harry_potter_prisoner_of_azkaban, fantasy_world).
popularity(harry_potter_prisoner_of_azkaban, unknown).
vote_count(harry_potter_prisoner_of_azkaban, unknown).
trending_status(harry_potter_prisoner_of_azkaban, unknown).

% ------------------------------------------------------------
% Pan's Labyrinth
% ------------------------------------------------------------
movie(pans_labyrinth).
title(pans_labyrinth, 'Pan''s Labyrinth').
runtime(pans_labyrinth, 118).
release_year(pans_labyrinth, 2006).
age_rating(pans_labyrinth, r).
original_language(pans_labyrinth, spanish).
genre(pans_labyrinth, fantasy).
genre(pans_labyrinth, drama).
genre(pans_labyrinth, historical).
director(pans_labyrinth, guillermo_del_toro).
producer(pans_labyrinth, bertha_navarro).
producer(pans_labyrinth, alfonso_cuaron).
producer(pans_labyrinth, frida_torresblanco).
producer(pans_labyrinth, guillermo_del_toro).
producer(pans_labyrinth, alvaro_augustin).
writer(pans_labyrinth, guillermo_del_toro).
actor(pans_labyrinth, ivana_baquero).
actor(pans_labyrinth, sergi_lopez).
actor(pans_labyrinth, maribel_verdu).
actor(pans_labyrinth, doug_jones).
character(pans_labyrinth, ofelia).
character(pans_labyrinth, captain_vidal).
character(pans_labyrinth, mercedes).
character(pans_labyrinth, faun).
keyword(pans_labyrinth, fairy_tale).
keyword(pans_labyrinth, war).
keyword(pans_labyrinth, fantasy).
keyword(pans_labyrinth, violence).
keyword(pans_labyrinth, child).
keyword(pans_labyrinth, labyrinth).
keyword(pans_labyrinth, spanish_civil_war).
popularity(pans_labyrinth, unknown).
vote_count(pans_labyrinth, unknown).
trending_status(pans_labyrinth, unknown).

% ------------------------------------------------------------
% Stardust
% ------------------------------------------------------------
movie(stardust).
title(stardust, 'Stardust').
runtime(stardust, 127).
release_year(stardust, 2007).
age_rating(stardust, pg13).
original_language(stardust, english).
genre(stardust, fantasy).
genre(stardust, adventure).
genre(stardust, romance).
director(stardust, matthew_vaughn).
producer(stardust, matthew_vaughn).
producer(stardust, lorenzo_di_bonaventura).
producer(stardust, michael_dreyer).
producer(stardust, neil_gaiman).
writer(stardust, jane_goldman).
writer(stardust, matthew_vaughn).
actor(stardust, charlie_cox).
actor(stardust, claire_danes).
actor(stardust, michelle_pfeiffer).
actor(stardust, robert_de_niro).
character(stardust, tristan_thorn).
character(stardust, yvaine).
character(stardust, lamia).
character(stardust, captain_shakespeare).
keyword(stardust, magic).
keyword(stardust, witch).
keyword(stardust, quest).
keyword(stardust, romance).
keyword(stardust, fallen_star).
keyword(stardust, fantasy_world).
keyword(stardust, adventure).
popularity(stardust, unknown).
vote_count(stardust, unknown).
trending_status(stardust, unknown).

% ------------------------------------------------------------
% The Princess Bride
% ------------------------------------------------------------
movie(the_princess_bride).
title(the_princess_bride, 'The Princess Bride').
runtime(the_princess_bride, 98).
release_year(the_princess_bride, 1987).
age_rating(the_princess_bride, pg).
original_language(the_princess_bride, english).
genre(the_princess_bride, fantasy).
genre(the_princess_bride, adventure).
genre(the_princess_bride, romance).
genre(the_princess_bride, comedy).
director(the_princess_bride, rob_reiner).
producer(the_princess_bride, andrew_scheinman).
producer(the_princess_bride, rob_reiner).
writer(the_princess_bride, william_goldman).
actor(the_princess_bride, cary_elwes).
actor(the_princess_bride, robin_wright).
actor(the_princess_bride, mandy_patinkin).
actor(the_princess_bride, chris_sarandon).
character(the_princess_bride, westley).
character(the_princess_bride, buttercup).
character(the_princess_bride, inigo_montoya).
character(the_princess_bride, prince_humperdinck).
keyword(the_princess_bride, fairy_tale).
keyword(the_princess_bride, sword_fight).
keyword(the_princess_bride, romance).
keyword(the_princess_bride, revenge).
keyword(the_princess_bride, comedy).
keyword(the_princess_bride, adventure).
keyword(the_princess_bride, rescue).
popularity(the_princess_bride, unknown).
vote_count(the_princess_bride, unknown).
trending_status(the_princess_bride, unknown).

% ------------------------------------------------------------
% Schindler's List
% ------------------------------------------------------------
movie(schindlers_list).
title(schindlers_list, 'Schindler''s List').
runtime(schindlers_list, 195).
release_year(schindlers_list, 1993).
age_rating(schindlers_list, r).
original_language(schindlers_list, english).
genre(schindlers_list, historical).
genre(schindlers_list, drama).
genre(schindlers_list, war).
director(schindlers_list, steven_spielberg).
producer(schindlers_list, steven_spielberg).
producer(schindlers_list, gerald_r_molen).
producer(schindlers_list, branko_lustig).
writer(schindlers_list, steven_zaillian).
actor(schindlers_list, liam_neeson).
actor(schindlers_list, ben_kingsley).
actor(schindlers_list, ralph_fiennes).
actor(schindlers_list, caroline_goodall).
character(schindlers_list, oskar_schindler).
character(schindlers_list, itzhak_stern).
character(schindlers_list, amon_goeth).
character(schindlers_list, emilie_schindler).
keyword(schindlers_list, holocaust).
keyword(schindlers_list, world_war_ii).
keyword(schindlers_list, biography).
keyword(schindlers_list, survival).
keyword(schindlers_list, persecution).
keyword(schindlers_list, history).
keyword(schindlers_list, war).
popularity(schindlers_list, unknown).
vote_count(schindlers_list, unknown).
trending_status(schindlers_list, unknown).

% ------------------------------------------------------------
% 1917
% ------------------------------------------------------------
movie(nineteen_seventeen).
title(nineteen_seventeen, '1917').
runtime(nineteen_seventeen, 119).
release_year(nineteen_seventeen, 2019).
age_rating(nineteen_seventeen, r).
original_language(nineteen_seventeen, english).
genre(nineteen_seventeen, historical).
genre(nineteen_seventeen, war).
genre(nineteen_seventeen, drama).
director(nineteen_seventeen, sam_mendes).
producer(nineteen_seventeen, sam_mendes).
producer(nineteen_seventeen, pippa_harris).
producer(nineteen_seventeen, jayne_ann_tenggren).
producer(nineteen_seventeen, callum_mcdougall).
producer(nineteen_seventeen, brian_oliver).
writer(nineteen_seventeen, sam_mendes).
writer(nineteen_seventeen, krysty_wilson_cairns).
actor(nineteen_seventeen, george_mackay).
actor(nineteen_seventeen, dean_charles_chapman).
actor(nineteen_seventeen, mark_strong).
actor(nineteen_seventeen, andrew_scott).
character(nineteen_seventeen, will_schofield).
character(nineteen_seventeen, tom_blake).
keyword(nineteen_seventeen, world_war_i).
keyword(nineteen_seventeen, soldier).
keyword(nineteen_seventeen, mission).
keyword(nineteen_seventeen, war).
keyword(nineteen_seventeen, survival).
keyword(nineteen_seventeen, trench).
keyword(nineteen_seventeen, historical).
popularity(nineteen_seventeen, unknown).
vote_count(nineteen_seventeen, unknown).
trending_status(nineteen_seventeen, unknown).

% ------------------------------------------------------------
% Oppenheimer
% ------------------------------------------------------------
movie(oppenheimer).
title(oppenheimer, 'Oppenheimer').
runtime(oppenheimer, 180).
release_year(oppenheimer, 2023).
age_rating(oppenheimer, r).
original_language(oppenheimer, english).
genre(oppenheimer, historical).
genre(oppenheimer, drama).
genre(oppenheimer, biography).
director(oppenheimer, christopher_nolan).
producer(oppenheimer, emma_thomas).
producer(oppenheimer, charles_roven).
producer(oppenheimer, christopher_nolan).
writer(oppenheimer, christopher_nolan).
actor(oppenheimer, cillian_murphy).
actor(oppenheimer, emily_blunt).
actor(oppenheimer, matt_damon).
actor(oppenheimer, robert_downey_jr).
character(oppenheimer, j_robert_oppenheimer).
character(oppenheimer, kitty_oppenheimer).
character(oppenheimer, leslie_groves).
character(oppenheimer, lewis_strauss).
keyword(oppenheimer, atomic_bomb).
keyword(oppenheimer, scientist).
keyword(oppenheimer, world_war_ii).
keyword(oppenheimer, politics).
keyword(oppenheimer, biography).
keyword(oppenheimer, science).
keyword(oppenheimer, manhattan_project).
popularity(oppenheimer, unknown).
vote_count(oppenheimer, unknown).
trending_status(oppenheimer, unknown).

% ------------------------------------------------------------
% The King's Speech
% ------------------------------------------------------------
movie(the_kings_speech).
title(the_kings_speech, 'The King''s Speech').
runtime(the_kings_speech, 118).
release_year(the_kings_speech, 2010).
age_rating(the_kings_speech, r).
original_language(the_kings_speech, english).
genre(the_kings_speech, historical).
genre(the_kings_speech, drama).
genre(the_kings_speech, biography).
director(the_kings_speech, tom_hooper).
producer(the_kings_speech, iain_canning).
producer(the_kings_speech, emile_sherman).
producer(the_kings_speech, gareth_unwin).
writer(the_kings_speech, david_seidler).
actor(the_kings_speech, colin_firth).
actor(the_kings_speech, geoffrey_rush).
actor(the_kings_speech, helena_bonham_carter).
actor(the_kings_speech, guy_pearce).
character(the_kings_speech, king_george_vi).
character(the_kings_speech, lionel_logue).
character(the_kings_speech, queen_elizabeth).
character(the_kings_speech, king_edward_viii).
keyword(the_kings_speech, royalty).
keyword(the_kings_speech, speech_disorder).
keyword(the_kings_speech, friendship).
keyword(the_kings_speech, world_war_ii).
keyword(the_kings_speech, biography).
keyword(the_kings_speech, british_history).
keyword(the_kings_speech, public_speaking).
popularity(the_kings_speech, unknown).
vote_count(the_kings_speech, unknown).
trending_status(the_kings_speech, unknown).

% ------------------------------------------------------------
% The Last Samurai
% ------------------------------------------------------------
movie(the_last_samurai).
title(the_last_samurai, 'The Last Samurai').
runtime(the_last_samurai, 154).
release_year(the_last_samurai, 2003).
age_rating(the_last_samurai, r).
original_language(the_last_samurai, english).
genre(the_last_samurai, historical).
genre(the_last_samurai, action).
genre(the_last_samurai, drama).
genre(the_last_samurai, adventure).
director(the_last_samurai, edward_zwick).
producer(the_last_samurai, tom_cruise).
producer(the_last_samurai, tom_engelman).
producer(the_last_samurai, scott_kroopf).
producer(the_last_samurai, paula_wagner).
producer(the_last_samurai, edward_zwick).
writer(the_last_samurai, john_logan).
writer(the_last_samurai, edward_zwick).
writer(the_last_samurai, marshall_herskovitz).
actor(the_last_samurai, tom_cruise).
actor(the_last_samurai, ken_watanabe).
actor(the_last_samurai, tony_goldwyn).
actor(the_last_samurai, timothy_spall).
character(the_last_samurai, nathan_algren).
character(the_last_samurai, katsumoto).
character(the_last_samurai, omura).
character(the_last_samurai, simon_graham).
keyword(the_last_samurai, samurai).
keyword(the_last_samurai, japan).
keyword(the_last_samurai, war).
keyword(the_last_samurai, honor).
keyword(the_last_samurai, culture_clash).
keyword(the_last_samurai, rebellion).
keyword(the_last_samurai, historical).
popularity(the_last_samurai, unknown).
vote_count(the_last_samurai, unknown).
trending_status(the_last_samurai, unknown).


% ============================================================
% BASIC HELPER QUERIES
% ============================================================

movie_count(Count) :-
    findall(Movie, movie(Movie), Movies),
    length(Movies, Count).

movies_by_genre(Genre, Movies) :-
    findall(Movie, genre(Movie, Genre), Movies).

movies_by_language(Language, Movies) :-
    findall(Movie, original_language(Movie, Language), Movies).

movies_by_director(Director, Movies) :-
    findall(Movie, director(Movie, Director), Movies).

movies_by_actor(Actor, Movies) :-
    findall(Movie, actor(Movie, Actor), Movies).

movies_with_character(Character, Movies) :-
    findall(Movie, character(Movie, Character), Movies).

movies_with_keyword(Keyword, Movies) :-
    findall(Movie, keyword(Movie, Keyword), Movies).

movie_raw_profile(Movie,
                  Title,
                  Runtime,
                  Year,
                  Rating,
                  Language) :-
    movie(Movie),
    title(Movie, Title),
    runtime(Movie, Runtime),
    release_year(Movie, Year),
    age_rating(Movie, Rating),
    original_language(Movie, Language).

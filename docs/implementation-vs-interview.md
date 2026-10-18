# Implementation vs the expert interview

**The implementation is now much closer to the interview.** The two earlier gaps, telling watched movies from
liked movies and allowing rewatches, are solved. Some features are still missing, and some scoring decisions
need the expert's validation.

## What is correct today

| Item | Assessment |
| --- | --- |
| Maximum duration, year range and required language | Implemented as requirements that a score cannot compensate for. |
| Rejection of genres, directors and actors | Implemented, with priority over the positive preferences. |
| Session audience | Uses the age of the youngest viewer, when it is set. |
| Minimum rating and tolerance | Tells main options from alternatives, and turns the tolerance off when the minimum is mandatory. |
| History with a personal rating | `watched=movie=rating` tells watched movies from liked movies. |
| Rating 0 | Means no rating; it is not treated as a negative rating. |
| Similarity to liked movies | Rule 41 uses personal ratings of 4–5, not any watched movie. |
| Rewatch request | `allow_rewatch=true` allows watched movies, without overriding the other restrictions. |
| Explanations | Shows positive reasons, satisfied requirements, unmet preferences and the score breakdown. |
| History validation | Rejects invalid ratings and repeated movies in the same user's history. |

The chosen format for the history is appropriate.

## What is still missing

Key: the rows with a yellow background and the mark **Missing data** depend on information that the catalogue
does not have yet.

<table>
  <thead><tr><th>Interview item</th><th>What is missing</th></tr></thead>
  <tbody>
    <tr style="background-color: #fff3cd; color: #332701;"><td><strong>Content and inappropriate language</strong> — questions 8, 14 and 15<br><strong>Missing data</strong></td><td>Reliable descriptors for each movie and content limits for the session. Language and age rating do not fully describe the content.</td></tr>
    <tr style="background-color: #fff3cd; color: #332701;"><td><strong>Accessible platforms</strong> — questions 6 and 13<br><strong>Missing data</strong></td><td>Availability by platform, region and date, and the platforms available to the user.</td></tr>
    <tr style="background-color: #fff3cd; color: #332701;"><td><strong>Sagas the user likes</strong> — question 21<br><strong>Missing data</strong></td><td>Identification of the sagas and the relation between titles, besides the user's preference.</td></tr>
    <tr><td><strong>Ratings from people with similar tastes</strong> — question 21</td><td>Compare personal ratings between users and define when the similarity is enough. The new history already provides part of the data needed.</td></tr>
    <tr><td><strong>Rating in the context of the genre</strong> — questions 4, 9 and 21</td><td>The IMDb rating is still used in absolute terms, with no context from the genre.</td></tr>
    <tr><td><strong>Tie-break by similarity</strong> — question 24</td><td>The ordering uses score, IMDb rating and id; it does not yet use the degree of similarity to liked movies as a tie-breaker.</td></tr>
  </tbody>
</table>

These features are not all exclusion restrictions. Platforms, sagas and opinions from similar users can work
as boosting factors, depending on the request.

## What should be changed or validated

1. **Make better use of the personal ratings.**
   Today, ratings **4 and 5 have the same effect**, and ratings **0, 1, 2 and 3 add nothing to the
   similarity**. This is a coherent first implementation, but it loses information.

   The contribution could grow gradually with the rating and the similarity. Negative ratings could lower the
   score of similar suggestions, but that would be an extension to validate, **not an automatic exclusion
   that the interview requires**.

2. **Review the weight of the similarity.**
   Its contribution is at most **1 point**, inside the secondary group capped at 9. Once that group has
   reached 9 points, the similarity no longer changes the score, although it still appears in the reasons.
   Either show this effect in the explanations or give the similarity a contribution of its own.

3. **Validate the weights and thresholds with the expert.**
   The values `40/30/10/10/9`, the minimum personal rating of 4 and the minimum similarity of 7 are
   decisions of the implementation. The interview supports the importance of the criteria, but **does not
   give these numbers**.

   The hierarchy genre → rating → director/actors is also not guaranteed absolutely by a weighted sum. We
   need to confirm whether the expert wants relative weights or a strict order.

4. **Clarify what rejecting a language means.**
   Rule 36 excludes a movie that has any rejected language, even if it also has an accepted one. That fits
   "I do not want to hear this language", but it may be too much for "I need a Portuguese version". For the
   second case we lack data about audio and subtitles.

5. **Tell a failed requirement from unknown information.**
   A movie that exceeds the maximum duration and a movie with no duration may get the same exclusion reason.
   The explanation should tell apart:
   - a requirement that was actually violated;
   - a requirement that could not be checked.

6. **Handle alternatives inside the same preference.**
   If the user accepts the pace `slow|medium`, a slow movie should not necessarily show `medium` as an unmet
   preference. We must define whether each list means "any of these values" or several independent tastes.

7. **Separate the permanent profile from the session request.**
   The system already represents session limits, but it stores them in the same row as the profile. A useful
   next step is to separate lasting tastes from conditions such as "today I have 100 minutes" or "today I am
   watching with children". This also avoids reading a past positive rating as a contradiction of a current
   rejection.

8. **Improve the validation of explicit conflicts.**
   The loader validates ratings, duplicates and year ranges, but it does not yet systematically find
   conditions such as the same actor being both preferred and rejected. A rating of 5 on a horror movie and
   the rejection of horror for the current session **should not automatically be treated as an error**.

## What to remove, or keep only as an extension

- **Remove none of the new essential restrictions**, nor the rated history.
- Consolidate **`audience` and popularity**, because both depend on the votes and may reward similar
  information twice. `audience=mainstream/niche` also does not represent the session audience.
- Keep **the wishlist, writers, countries, pace, humour and complexity** as optional extensions, without
  presenting them as rules confirmed by the expert.
- Do not use **violence inferred from the genre** as a guarantee that the content is suitable.
- Do not turn **low personal ratings** into mandatory rejections of genres, actors or similar movies.

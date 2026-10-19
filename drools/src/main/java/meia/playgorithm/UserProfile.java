package meia.playgorithm;

import meia.playgorithm.facts.Attribute;
import meia.playgorithm.facts.Dislikes;
import meia.playgorithm.facts.Likes;
import meia.playgorithm.facts.Limit;
import meia.playgorithm.facts.Prefers;
import meia.playgorithm.facts.User;
import meia.playgorithm.facts.UserLimit;
import meia.playgorithm.facts.Watched;
import meia.playgorithm.facts.Wishlist;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The facts of one user, built from a CSV row
 * (or as the API builds them from a request). It only groups input facts.
 */
public record UserProfile(
    User user,
    List<Likes> likes,
    List<Dislikes> dislikes,
    List<Prefers> prefers,
    List<Wishlist> wishlist,
    List<Watched> watched,
    List<UserLimit> limits
) {

    /** Optional preference columns and the movie attribute they refer to. */
    public static final Map<String, Attribute> PREFERENCE_COLUMNS = preferenceColumns();

    public UserProfile {
        likes = List.copyOf(likes);
        dislikes = List.copyOf(dislikes);
        prefers = List.copyOf(prefers);
        wishlist = List.copyOf(wishlist);
        watched = List.copyOf(watched);
        limits = List.copyOf(limits);
    }

    public String id() {
        return user.id();
    }

    public static Builder builder(String userId, Integer age) {
        return new Builder(userId, age);
    }

    private static Map<String, Attribute> preferenceColumns() {
        Map<String, Attribute> columns = new LinkedHashMap<>();
        columns.put("preferred_directors", Attribute.DIRECTOR);
        columns.put("preferred_writers", Attribute.WRITER);
        columns.put("preferred_stars", Attribute.STAR);
        columns.put("preferred_countries", Attribute.COUNTRY_ORIGIN);
        columns.put("preferred_subgenres", Attribute.SUBGENRE);
        columns.put("preferred_pace", Attribute.PACE);
        columns.put("preferred_complexity", Attribute.COMPLEXITY);
        columns.put("preferred_violence", Attribute.VIOLENCE);
        columns.put("preferred_humor", Attribute.HUMOR);
        columns.put("preferred_psychological_intensity", Attribute.PSYCHOLOGICAL_INTENSITY);
        columns.put("preferred_emotional_tones", Attribute.EMOTIONAL_TONE);
        columns.put("preferred_themes", Attribute.THEMES);
        columns.put("preferred_audience", Attribute.AUDIENCE);
        columns.put("preferred_eras", Attribute.ERA);
        columns.put("preferred_popularity", Attribute.POPULARITY);
        return columns;
    }

    public static final class Builder {
        private final String userId;
        private final Integer age;
        private final List<Likes> likes = new ArrayList<>();
        private final List<Dislikes> dislikes = new ArrayList<>();
        private final List<Prefers> prefers = new ArrayList<>();
        private final List<Wishlist> wishlist = new ArrayList<>();
        private final List<Watched> watched = new ArrayList<>();
        private final List<UserLimit> limits = new ArrayList<>();

        private Builder(String userId, Integer age) {
            this.userId = userId;
            this.age = age;
        }

        public Builder likes(Attribute attribute, String value) {
            add(likes, new Likes(userId, attribute, normalizeGenre(attribute, value)));
            return this;
        }

        public Builder dislikes(Attribute attribute, String value) {
            add(dislikes, new Dislikes(userId, attribute, normalizeGenre(attribute, value)));
            return this;
        }

        public Builder prefers(Attribute attribute, String value) {
            add(prefers, new Prefers(userId, attribute, value));
            return this;
        }

        public Builder wishlist(String movieId) {
            add(wishlist, new Wishlist(userId, movieId));
            return this;
        }

        public Builder watched(String movieId, int rating) {
            if (watched.stream().noneMatch(entry -> entry.movieId().equals(movieId))) {
                watched.add(new Watched(userId, movieId, rating));
            }
            return this;
        }

        public Builder limit(Limit limit, String value) {
            add(limits, new UserLimit(userId, limit, value));
            return this;
        }

        public UserProfile build() {
            return new UserProfile(new User(userId, age), likes, dislikes, prefers, wishlist, watched, limits);
        }

        // The CSV may write Sci-Fi; the catalogue uses SciFi.
        private static String normalizeGenre(Attribute attribute, String value) {
            return attribute == Attribute.GENRE && value.equals("Sci-Fi") ? "SciFi" : value;
        }

        private static <T> void add(List<T> facts, T fact) {
            if (!facts.contains(fact)) {
                facts.add(fact);
            }
        }
    }
}

package meia.playgorithm.model;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class Movie {

    private static final Map<String, Integer> AGE_RATINGS = Map.of(
        "G", 0,
        "PG", 0,
        "PG-13", 13,
        "R", 18,
        "NC-17", 18
    );

    private final String id;
    private final String title;
    private final Set<String> genres = new LinkedHashSet<>();
    private final Set<String> languages = new LinkedHashSet<>();
    private final Set<String> directors = new LinkedHashSet<>();
    private final Set<String> writers = new LinkedHashSet<>();
    private final Set<String> stars = new LinkedHashSet<>();
    private final Set<String> countries = new LinkedHashSet<>();
    private final Set<String> subgenres = new LinkedHashSet<>();
    private final Set<String> emotionalTones = new LinkedHashSet<>();
    private final Set<String> themes = new LinkedHashSet<>();
    private final Set<String> similarTo = new LinkedHashSet<>();
    private final List<PreferenceReason> preferenceReasons = new ArrayList<>();
    private final List<String> exclusionReasons = new ArrayList<>();

    private int year;
    private int durationMinutes;
    private String ratingMpa;
    private double ratingImdb;
    private String pace;
    private String complexity;
    private String violence;
    private String humor;
    private String psychologicalIntensity;
    private String audience;
    private String era;
    private String popularity;
    private boolean recommended;

    public Movie(String title, String genre, int year) {
        this.id = title;
        this.title = title;
        this.year = year;
        addGenre(genre);
    }

    public static Movie identified(String id, String title, int year) {
        return new Movie(id, title, year, true);
    }

    private Movie(String id, String title, int year, boolean identified) {
        this.id = id;
        this.title = title;
        this.year = year;
    }

    public String getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getGenre() {
        return genres.stream().findFirst().orElse(null);
    }

    public Set<String> getGenres() {
        return genres;
    }

    public Set<String> getLanguages() {
        return languages;
    }

    public Set<String> getDirectors() {
        return directors;
    }

    public Set<String> getWriters() {
        return writers;
    }

    public Set<String> getStars() {
        return stars;
    }

    public Set<String> getCountries() {
        return countries;
    }

    public Set<String> getSubgenres() {
        return subgenres;
    }

    public Set<String> getEmotionalTones() {
        return emotionalTones;
    }

    public Set<String> getThemes() {
        return themes;
    }

    public Set<String> getSimilarTo() {
        return similarTo;
    }

    public int getYear() {
        return year;
    }

    public int getDurationMinutes() {
        return durationMinutes;
    }

    public String getRatingMpa() {
        return ratingMpa;
    }

    public double getRatingImdb() {
        return ratingImdb;
    }

    public String getPace() {
        return pace;
    }

    public String getComplexity() {
        return complexity;
    }

    public String getViolence() {
        return violence;
    }

    public String getHumor() {
        return humor;
    }

    public String getPsychologicalIntensity() {
        return psychologicalIntensity;
    }

    public String getAudience() {
        return audience;
    }

    public String getEra() {
        return era;
    }

    public String getPopularity() {
        return popularity;
    }

    public List<PreferenceReason> getPreferenceReasons() {
        return preferenceReasons;
    }

    public List<String> getExclusionReasons() {
        return exclusionReasons;
    }

    public boolean isRecommended() {
        return recommended;
    }

    public Movie addGenre(String value) {
        addValue(genres, value);
        return this;
    }

    public Movie addLanguage(String value) {
        addValue(languages, value);
        return this;
    }

    public Movie addDirector(String value) {
        addValue(directors, value);
        return this;
    }

    public Movie addWriter(String value) {
        addValue(writers, value);
        return this;
    }

    public Movie addStar(String value) {
        addValue(stars, value);
        return this;
    }

    public Movie addCountry(String value) {
        addValue(countries, value);
        return this;
    }

    public Movie addSubgenre(String value) {
        addValue(subgenres, value);
        return this;
    }

    public Movie addEmotionalTone(String value) {
        addValue(emotionalTones, value);
        return this;
    }

    public Movie addTheme(String value) {
        addValue(themes, value);
        return this;
    }

    public Movie addSimilarTo(String movieId) {
        addValue(similarTo, movieId);
        return this;
    }

    public Movie withDurationMinutes(int durationMinutes) {
        this.durationMinutes = durationMinutes;
        return this;
    }

    public Movie withRatingMpa(String ratingMpa) {
        this.ratingMpa = ratingMpa;
        return this;
    }

    public Movie withRatingImdb(double ratingImdb) {
        this.ratingImdb = ratingImdb;
        return this;
    }

    public Movie withPace(String pace) {
        this.pace = pace;
        return this;
    }

    public Movie withComplexity(String complexity) {
        this.complexity = complexity;
        return this;
    }

    public Movie withViolence(String violence) {
        this.violence = violence;
        return this;
    }

    public Movie withHumor(String humor) {
        this.humor = humor;
        return this;
    }

    public Movie withPsychologicalIntensity(String psychologicalIntensity) {
        this.psychologicalIntensity = psychologicalIntensity;
        return this;
    }

    public Movie withAudience(String audience) {
        this.audience = audience;
        return this;
    }

    public Movie withEra(String era) {
        this.era = era;
        return this;
    }

    public Movie withPopularity(String popularity) {
        this.popularity = popularity;
        return this;
    }

    public boolean hasAnyGenre(Set<String> values) {
        return overlaps(genres, values);
    }

    public boolean hasAnyLanguage(Set<String> values) {
        return overlaps(languages, values);
    }

    public boolean hasAnyDirector(Set<String> values) {
        return overlaps(directors, values);
    }

    public boolean hasAnyWriter(Set<String> values) {
        return overlaps(writers, values);
    }

    public boolean hasAnyStar(Set<String> values) {
        return overlaps(stars, values);
    }

    public boolean hasAnyCountry(Set<String> values) {
        return overlaps(countries, values);
    }

    public boolean hasAnySubgenre(Set<String> values) {
        return overlaps(subgenres, values);
    }

    public boolean hasAnyEmotionalTone(Set<String> values) {
        return overlaps(emotionalTones, values);
    }

    public boolean hasAnyTheme(Set<String> values) {
        return overlaps(themes, values);
    }

    public boolean hasAnySimilarity(Set<String> watchedMovieIds) {
        return overlaps(similarTo, watchedMovieIds);
    }

    public boolean matchesPace(Set<String> values) {
        return values.contains(pace);
    }

    public boolean matchesComplexity(Set<String> values) {
        return values.contains(complexity);
    }

    public boolean matchesViolence(Set<String> values) {
        return values.contains(violence);
    }

    public boolean matchesHumor(Set<String> values) {
        return values.contains(humor);
    }

    public boolean matchesPsychologicalIntensity(Set<String> values) {
        return values.contains(psychologicalIntensity);
    }

    public boolean matchesAudience(Set<String> values) {
        return values.contains(audience);
    }

    public boolean matchesEra(Set<String> values) {
        return values.contains(era);
    }

    public boolean matchesPopularity(Set<String> values) {
        return values.contains(popularity);
    }

    public boolean isAgeAllowed(int age) {
        if (age >= 18) {
            return true;
        }

        Integer minimumAge = AGE_RATINGS.get(ratingMpa);
        return minimumAge != null && age >= minimumAge;
    }

    public boolean isExcluded() {
        return !exclusionReasons.isEmpty();
    }

    public boolean hasPreferenceReasons() {
        return !preferenceReasons.isEmpty();
    }

    public boolean hasPreferenceReason(String type) {
        return preferenceReasons.stream().anyMatch(reason -> reason.type().equals(type));
    }

    public boolean hasExclusionReason(String reason) {
        return exclusionReasons.contains(reason);
    }

    public boolean hasRatingBelow(double minimumRating) {
        return ratingImdb > 0 && ratingImdb < minimumRating;
    }

    public void addExclusion(String reason) {
        if (!exclusionReasons.contains(reason)) {
            exclusionReasons.add(reason);
        }
    }

    public void addPreferenceReason(String type, String value, int weight) {
        PreferenceReason reason = new PreferenceReason(type, value, weight);
        if (!preferenceReasons.contains(reason)) {
            preferenceReasons.add(reason);
        }
    }

    public void markRecommended() {
        recommended = true;
    }

    public Recommendation toRecommendation(UserPreferences preferences) {
        Map<String, Double> breakdown = scoreBreakdown(preferences);
        double score = breakdown.values().stream().mapToDouble(Double::doubleValue).sum();
        List<String> labels = preferenceReasons.stream()
            .map(PreferenceReason::label)
            .toList();
        List<String> unmet = unmetPreferences(preferences);
        String status = preferences.hasMinimumRating()
            && hasRatingBelow(preferences.getMinimumRating()) ? "alternative" : "main";

        return new Recommendation(id, title, round(score), status, labels, unmet, breakdown);
    }

    private Map<String, Double> scoreBreakdown(UserPreferences preferences) {
        Map<String, Double> breakdown = new LinkedHashMap<>();
        breakdown.put("genre", hasReason("genre") ? 40.0 : 0.0);
        breakdown.put("rating", ratingImdb > 0 ? round(ratingImdb * 3.0) : 0.0);
        breakdown.put("director", hasReason("director") ? 10.0 : 0.0);
        breakdown.put("star", hasReason("star") ? 10.0 : 0.0);

        double secondary = preferenceReasons.stream()
            .filter(reason -> reason.isSecondary())
            .mapToInt(PreferenceReason::weight)
            .sum();
        breakdown.put("secondary", Math.min(9.0, secondary));
        return breakdown;
    }

    private boolean hasReason(String type) {
        return preferenceReasons.stream().anyMatch(reason -> reason.type().equals(type));
    }

    private List<String> unmetPreferences(UserPreferences preferences) {
        List<String> unmet = new ArrayList<>();

        if (!preferences.getLikedGenres().isEmpty() && !hasAnyGenre(preferences.getLikedGenres())) {
            unmet.add("genre");
        }
        if (!preferences.getLikedLanguages().isEmpty() && !hasAnyLanguage(preferences.getLikedLanguages())) {
            unmet.add("language");
        }
        if (!preferences.getPreferredDirectors().isEmpty() && !hasAnyDirector(preferences.getPreferredDirectors())) {
            unmet.add("director");
        }
        if (!preferences.getPreferredStars().isEmpty() && !hasAnyStar(preferences.getPreferredStars())) {
            unmet.add("star");
        }
        if (preferences.hasMinimumRating() && hasRatingBelow(preferences.getMinimumRating())) {
            unmet.add("rating below target");
        }

        return unmet;
    }

    private static void addValue(Set<String> target, String value) {
        if (value != null && !value.isBlank()) {
            target.add(value);
        }
    }

    private static boolean overlaps(Set<String> left, Set<String> right) {
        return left.stream().anyMatch(right::contains);
    }

    private static double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}

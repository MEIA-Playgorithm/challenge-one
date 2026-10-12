package meia.playgorithm;

import java.util.LinkedHashSet;
import java.util.Set;

public class UserPreferences {

    private final String userId;
    private final Set<String> watchedMovieIds = new LinkedHashSet<>();
    private final Set<String> wishlistMovieIds = new LinkedHashSet<>();
    private final Set<String> likedGenres = new LinkedHashSet<>();
    private final Set<String> dislikedGenres = new LinkedHashSet<>();
    private final Set<String> likedLanguages = new LinkedHashSet<>();
    private final Set<String> dislikedLanguages = new LinkedHashSet<>();
    private final Set<String> requiredLanguages = new LinkedHashSet<>();
    private final Set<String> preferredDirectors = new LinkedHashSet<>();
    private final Set<String> dislikedDirectors = new LinkedHashSet<>();
    private final Set<String> preferredWriters = new LinkedHashSet<>();
    private final Set<String> preferredStars = new LinkedHashSet<>();
    private final Set<String> dislikedStars = new LinkedHashSet<>();
    private final Set<String> preferredCountries = new LinkedHashSet<>();
    private final Set<String> preferredSubgenres = new LinkedHashSet<>();
    private final Set<String> preferredPace = new LinkedHashSet<>();
    private final Set<String> preferredComplexity = new LinkedHashSet<>();
    private final Set<String> preferredViolence = new LinkedHashSet<>();
    private final Set<String> preferredHumor = new LinkedHashSet<>();
    private final Set<String> preferredPsychologicalIntensity = new LinkedHashSet<>();
    private final Set<String> preferredEmotionalTones = new LinkedHashSet<>();
    private final Set<String> preferredThemes = new LinkedHashSet<>();
    private final Set<String> preferredAudience = new LinkedHashSet<>();
    private final Set<String> preferredEras = new LinkedHashSet<>();
    private final Set<String> preferredPopularity = new LinkedHashSet<>();
    private final Set<String> mandatoryGenres = new LinkedHashSet<>();
    private final Set<String> mandatoryDirectors = new LinkedHashSet<>();
    private final Set<String> mandatoryStars = new LinkedHashSet<>();

    private int age = 18;
    private int sessionMinimumAge = -1;
    private int maximumDurationMinutes = -1;
    private int yearFrom = Integer.MIN_VALUE;
    private int yearTo = Integer.MAX_VALUE;
    private double minimumRating = -1;
    private double ratingTolerance;
    private boolean ratingRequired;
    private boolean allowRewatch;

    public UserPreferences(String favoriteGenre) {
        this.userId = "user";
        addLikedGenre(favoriteGenre);
    }

    public static UserPreferences forUser(String userId) {
        return new UserPreferences(userId, true);
    }

    private UserPreferences(String userId, boolean identified) {
        this.userId = userId;
    }

    public String getUserId() {
        return userId;
    }

    public String getFavoriteGenre() {
        return likedGenres.stream().findFirst().orElse(null);
    }

    public Set<String> getWatchedMovieIds() {
        return watchedMovieIds;
    }

    public Set<String> getWishlistMovieIds() {
        return wishlistMovieIds;
    }

    public Set<String> getLikedGenres() {
        return likedGenres;
    }

    public Set<String> getDislikedGenres() {
        return dislikedGenres;
    }

    public Set<String> getLikedLanguages() {
        return likedLanguages;
    }

    public Set<String> getDislikedLanguages() {
        return dislikedLanguages;
    }

    public Set<String> getRequiredLanguages() {
        return requiredLanguages;
    }

    public Set<String> getPreferredDirectors() {
        return preferredDirectors;
    }

    public Set<String> getDislikedDirectors() {
        return dislikedDirectors;
    }

    public Set<String> getPreferredWriters() {
        return preferredWriters;
    }

    public Set<String> getPreferredStars() {
        return preferredStars;
    }

    public Set<String> getDislikedStars() {
        return dislikedStars;
    }

    public Set<String> getPreferredCountries() {
        return preferredCountries;
    }

    public Set<String> getPreferredSubgenres() {
        return preferredSubgenres;
    }

    public Set<String> getPreferredPace() {
        return preferredPace;
    }

    public Set<String> getPreferredComplexity() {
        return preferredComplexity;
    }

    public Set<String> getPreferredViolence() {
        return preferredViolence;
    }

    public Set<String> getPreferredHumor() {
        return preferredHumor;
    }

    public Set<String> getPreferredPsychologicalIntensity() {
        return preferredPsychologicalIntensity;
    }

    public Set<String> getPreferredEmotionalTones() {
        return preferredEmotionalTones;
    }

    public Set<String> getPreferredThemes() {
        return preferredThemes;
    }

    public Set<String> getPreferredAudience() {
        return preferredAudience;
    }

    public Set<String> getPreferredEras() {
        return preferredEras;
    }

    public Set<String> getPreferredPopularity() {
        return preferredPopularity;
    }

    public Set<String> getMandatoryGenres() {
        return mandatoryGenres;
    }

    public Set<String> getMandatoryDirectors() {
        return mandatoryDirectors;
    }

    public Set<String> getMandatoryStars() {
        return mandatoryStars;
    }

    public int getAge() {
        return age;
    }

    public int getSessionMinimumAge() {
        return sessionMinimumAge;
    }

    public int getAudienceAge() {
        return sessionMinimumAge >= 0 ? sessionMinimumAge : age;
    }

    public int getMaximumDurationMinutes() {
        return maximumDurationMinutes;
    }

    public int getYearFrom() {
        return yearFrom;
    }

    public int getYearTo() {
        return yearTo;
    }

    public double getMinimumRating() {
        return minimumRating;
    }

    public double getRatingTolerance() {
        return ratingRequired ? 0 : ratingTolerance;
    }

    public boolean isRatingRequired() {
        return ratingRequired;
    }

    public boolean isAllowRewatch() {
        return allowRewatch;
    }

    public boolean hasMaximumDuration() {
        return maximumDurationMinutes > 0;
    }

    public boolean hasYearFrom() {
        return yearFrom != Integer.MIN_VALUE;
    }

    public boolean hasYearTo() {
        return yearTo != Integer.MAX_VALUE;
    }

    public boolean hasMinimumRating() {
        return minimumRating >= 0;
    }

    public boolean hasWatchedMovie(String movieId) {
        return watchedMovieIds.contains(movieId);
    }

    public boolean hasWishlistMovie(String movieId) {
        return wishlistMovieIds.contains(movieId);
    }

    public UserPreferences withAge(int age) {
        this.age = age;
        return this;
    }

    public UserPreferences withSessionMinimumAge(int sessionMinimumAge) {
        this.sessionMinimumAge = sessionMinimumAge;
        return this;
    }

    public UserPreferences withMaximumDurationMinutes(int maximumDurationMinutes) {
        this.maximumDurationMinutes = maximumDurationMinutes;
        return this;
    }

    public UserPreferences withYearFrom(int yearFrom) {
        this.yearFrom = yearFrom;
        return this;
    }

    public UserPreferences withYearTo(int yearTo) {
        this.yearTo = yearTo;
        return this;
    }

    public UserPreferences withMinimumRating(double minimumRating, double ratingTolerance, boolean ratingRequired) {
        this.minimumRating = minimumRating;
        this.ratingTolerance = ratingTolerance;
        this.ratingRequired = ratingRequired;
        return this;
    }

    public UserPreferences allowRewatch(boolean allowRewatch) {
        this.allowRewatch = allowRewatch;
        return this;
    }

    public UserPreferences addWatchedMovie(String value) {
        addValue(watchedMovieIds, value);
        return this;
    }

    public UserPreferences addWishlistMovie(String value) {
        addValue(wishlistMovieIds, value);
        return this;
    }

    public UserPreferences addLikedGenre(String value) {
        addValue(likedGenres, value);
        return this;
    }

    public UserPreferences addDislikedGenre(String value) {
        addValue(dislikedGenres, value);
        return this;
    }

    public UserPreferences addLikedLanguage(String value) {
        addValue(likedLanguages, value);
        return this;
    }

    public UserPreferences addDislikedLanguage(String value) {
        addValue(dislikedLanguages, value);
        return this;
    }

    public UserPreferences addRequiredLanguage(String value) {
        addValue(requiredLanguages, value);
        return this;
    }

    public UserPreferences addPreferredDirector(String value) {
        addValue(preferredDirectors, value);
        return this;
    }

    public UserPreferences addDislikedDirector(String value) {
        addValue(dislikedDirectors, value);
        return this;
    }

    public UserPreferences addPreferredWriter(String value) {
        addValue(preferredWriters, value);
        return this;
    }

    public UserPreferences addPreferredStar(String value) {
        addValue(preferredStars, value);
        return this;
    }

    public UserPreferences addDislikedStar(String value) {
        addValue(dislikedStars, value);
        return this;
    }

    public UserPreferences addPreferredCountry(String value) {
        addValue(preferredCountries, value);
        return this;
    }

    public UserPreferences addPreferredSubgenre(String value) {
        addValue(preferredSubgenres, value);
        return this;
    }

    public UserPreferences addPreferredPace(String value) {
        addValue(preferredPace, value);
        return this;
    }

    public UserPreferences addPreferredComplexity(String value) {
        addValue(preferredComplexity, value);
        return this;
    }

    public UserPreferences addPreferredViolence(String value) {
        addValue(preferredViolence, value);
        return this;
    }

    public UserPreferences addPreferredHumor(String value) {
        addValue(preferredHumor, value);
        return this;
    }

    public UserPreferences addPreferredPsychologicalIntensity(String value) {
        addValue(preferredPsychologicalIntensity, value);
        return this;
    }

    public UserPreferences addPreferredEmotionalTone(String value) {
        addValue(preferredEmotionalTones, value);
        return this;
    }

    public UserPreferences addPreferredTheme(String value) {
        addValue(preferredThemes, value);
        return this;
    }

    public UserPreferences addPreferredAudience(String value) {
        addValue(preferredAudience, value);
        return this;
    }

    public UserPreferences addPreferredEra(String value) {
        addValue(preferredEras, value);
        return this;
    }

    public UserPreferences addPreferredPopularity(String value) {
        addValue(preferredPopularity, value);
        return this;
    }

    public UserPreferences addMandatoryGenre(String value) {
        addValue(mandatoryGenres, value);
        return this;
    }

    public UserPreferences addMandatoryDirector(String value) {
        addValue(mandatoryDirectors, value);
        return this;
    }

    public UserPreferences addMandatoryStar(String value) {
        addValue(mandatoryStars, value);
        return this;
    }

    private static void addValue(Set<String> target, String value) {
        if (value != null && !value.isBlank()) {
            target.add(value);
        }
    }
}

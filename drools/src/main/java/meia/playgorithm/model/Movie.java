package meia.playgorithm.model;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Raw movie data from knowledge_base_movies.csv (title, year, votes, genres,
 * ...).
 * Rules never change it; everything inferred about a movie is a separate fact.
 */
public record Movie(
    String id,
    String title,
    Integer year,
    Integer votes,
    String duration,
    String ratingMpa,
    String ratingImdb,
    List<String> directors,
    List<String> writers,
    List<String> stars,
    List<String> genres,
    List<String> countries,
    List<String> companies,
    List<String> languages
) {

    private static final Pattern HOURS = Pattern.compile("^([0-9]+)h(?:[ ]*([0-9]+)m)?$");
    private static final Pattern MINUTES = Pattern.compile("^([0-9]+)m$");

    public Movie {
        directors = List.copyOf(directors);
        writers = List.copyOf(writers);
        stars = List.copyOf(stars);
        genres = List.copyOf(genres);
        countries = List.copyOf(countries);
        companies = List.copyOf(companies);
        languages = List.copyOf(languages);
    }

    /** The CSV values of an attribute that is stored with the movie (genre, director, ...). */
    public List<String> valuesOf(Attribute attribute) {
        return switch (attribute) {
            case GENRE -> genres;
            case LANGUAGE -> languages;
            case DIRECTOR -> directors;
            case WRITER -> writers;
            case STAR -> stars;
            case COUNTRY_ORIGIN -> countries;
            default -> List.of();
        };
    }

    /** IMDb rating as a number between 0 and 10, or null. */
    public Double rating() {
        if (ratingImdb == null || ratingImdb.isBlank()) {
            return null;
        }
        try {
            double rating = Double.parseDouble(ratingImdb.trim().replace(',', '.'));
            return rating >= 0 && rating <= 10 ? rating : null;
        } catch (NumberFormatException ignored) {
            return null;
        }
    }

    /** Rating as text: 8.2, or 8 when the CSV value is an integer. */
    public String ratingText() {
        Double rating = rating();
        if (rating == null) {
            return null;
        }
        boolean decimal = ratingImdb.contains(",") || ratingImdb.contains(".");
        return decimal ? Double.toString(rating) : Long.toString(Math.round(rating));
    }

    /** Duration in minutes for "2h 20m", "2h" or "95m", or null. */
    public Integer minutes() {
        if (duration == null) {
            return null;
        }
        String text = duration.trim().replaceAll("\\s+", " ");
        Matcher hours = HOURS.matcher(text);
        if (hours.matches()) {
            int extra = hours.group(2) == null ? 0 : Integer.parseInt(hours.group(2));
            int minutes = Integer.parseInt(hours.group(1)) * 60 + extra;
            return extra < 60 && minutes > 0 ? minutes : null;
        }
        Matcher minutesOnly = MINUTES.matcher(text);
        if (minutesOnly.matches()) {
            int minutes = Integer.parseInt(minutesOnly.group(1));
            return minutes > 0 ? minutes : null;
        }
        return null;
    }
}

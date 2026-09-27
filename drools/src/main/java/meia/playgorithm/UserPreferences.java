package meia.playgorithm;

public class UserPreferences {

    private String favoriteGenre;

    public UserPreferences(String favoriteGenre) {
        this.favoriteGenre = favoriteGenre;
    }

    public String getFavoriteGenre() {
        return favoriteGenre;
    }
}
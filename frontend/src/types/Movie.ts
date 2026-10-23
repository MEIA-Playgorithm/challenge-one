export type Movie = {
    id: string;
    title: string;
    year: number | null;
    duration: string;
    rating_imdb: number | null;
    genre: string[];
    director: string[];
    writer: string[];
    star: string[];
    country_origin: string[];
    language: string[];
};

export type Movie = {
    id: string;
    title: string;
    year: number | null;
    duration: string;
    rating_imdb: number | null;
    genre: string[];
    director: string[];
    star: string[];
    language: string[];
};

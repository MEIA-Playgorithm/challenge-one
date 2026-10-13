export type Recommendation = {
    score: number;
    status: "main" | "alternative";
    movie: {
        id: string;
        title: string;
        genre: string[];
        rating_imdb: string | null;
    };
};

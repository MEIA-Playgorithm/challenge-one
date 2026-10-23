export type Reason = {
    type: string;
    value?: string | number;
    movie_id?: string;
};

export type UnmetPreference = {
    type: string;
    arguments: string[];
};

export type Recommendation = {
    score: number;
    status: "main" | "alternative";
    movie: {
        id: string;
        title: string;
        genre: string[];
        rating_imdb: number | null;
    };
    reasons: Reason[];
    unmet_preferences: UnmetPreference[];
    score_breakdown: Record<string, number>;
};

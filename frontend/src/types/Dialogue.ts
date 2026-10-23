// Response of POST /api/dialogo.

// A rule term: full text plus parts, to describe it in words. An argument is null when it
// is a still-unbound variable (e.g. the choice about to be made).
export type DialogueTerm = {
    text: string;
    name: string;
    args: (string | null)[];
};

// A question's "why": the rule being evaluated, its conditions in the order the engine
// checks them and the facts it concludes if all hold. `asking` is the condition being
// asked; earlier ones already hold.
export type DialogueWhy = {
    rule: string | number;
    conditions: DialogueTerm[];
    asking: number | null;
    concludes: DialogueTerm[];
};

export type DialogueQuestion = {
    key: string;
    text: string;
    options: string[];
    why: DialogueWhy;
};

export type AnsweredQuestion = DialogueQuestion & { answer: string };

export type DialogueConclusion = {
    fact: DialogueTerm;
    rule: string | number;
    premises: DialogueTerm[];
};

// A user recommendation that meets dialogue suggestions (`matches`).
export type DialoguePick = {
    score: number;
    status: "main" | "alternative";
    matches: { type: "genre" | "emotional_tone" | "themes"; value: string }[];
    movie: {
        id: string;
        title: string;
        year: number | null;
        genre: string[];
        rating_imdb: number | null;
    };
};

export type Dialogue = {
    user_id: string;
    history: AnsweredQuestion[];
    question: DialogueQuestion | null;
    conclusions: DialogueConclusion[];
    picks: DialoguePick[];
};

// Given answers, by question (`key`).
export type DialogueAnswers = Record<string, string>;

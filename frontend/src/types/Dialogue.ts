// Resposta de POST /api/dialogo (só no motor Prolog).

// Um termo Prolog: o texto completo e as partes, para o descrever por palavras. Um argumento
// é null quando é uma variável ainda por ligar (ex.: a escolha que vai ser feita).
export type DialogueTerm = {
    text: string;
    name: string;
    args: (string | null)[];
};

// O "porque" de uma pergunta: a regra em avaliação, as suas condições pela ordem em que o
// motor as verifica e os factos que conclui se todas se verificarem. `asking` é a condição
// perguntada; as anteriores já se verificaram.
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

// Uma recomendação do utilizador que cumpre sugestões do diálogo (`matches`).
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

// Respostas dadas, por pergunta (`key`).
export type DialogueAnswers = Record<string, string>;

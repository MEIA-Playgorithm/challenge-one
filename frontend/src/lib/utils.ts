export const initials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const avatarTones = ["#1f6b55", "#1a4d40", "#2b7a63"];

export const avatarColor = (id: string) => {
    const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return avatarTones[index % avatarTones.length];
};

export const withValues = (options: string[], values: string[]) => [...new Set([...options, ...values])];

const catalogWords: Record<string, string> = {
    SciFi: "Sci-Fi",
    ComingofAge: "Coming-of-Age",
    HandDrawn: "Hand-Drawn",
    HighConcept: "High-Concept",
    OnePerson: "One-Person",
};

// Values (CSV, engines) stay in English; this is only how they display in the UI.
const ptLabels: Record<string, string> = {
    slow: "Lento", medium: "Médio", fast: "Rápido", low: "Baixo", high: "Alto",
    tense: "Tenso", dark: "Sombrio", sad: "Triste", lighthearted: "Descontraído", romantic: "Romântico", reflective: "Reflexivo", exciting: "Empolgante",
    love: "Amor", family: "Família", growing_up: "Crescer", crime: "Crime", justice: "Justiça", war: "Guerra", history: "História",
    technology: "Tecnologia", supernatural: "Sobrenatural", exploration: "Exploração", psychology: "Psicologia", music: "Música", sport: "Desporto", life_story: "História de vida",
    mainstream: "Generalista", niche: "Nicho", classic: "Clássico", modern: "Moderno", recent: "Recente",
    very_popular: "Muito popular", popular: "Popular", less_popular: "Menos popular",
    Action: "Ação", Adventure: "Aventura", Animation: "Animação", Biography: "Biografia", Comedy: "Comédia", Crime: "Crime", Documentary: "Documentário",
    Drama: "Drama", Epic: "Épico", Family: "Família", Fantasy: "Fantasia", History: "História", Holiday: "Festividades", Horror: "Terror", Music: "Música",
    Musical: "Musical", Mystery: "Mistério", Romance: "Romance", SciFi: "Ficção científica", Sport: "Desporto", Thriller: "Thriller", Tragedy: "Tragédia",
    War: "Guerra", Western: "Western",
    Arabic: "Árabe", Cantonese: "Cantonês", Czech: "Checo", Danish: "Dinamarquês", English: "Inglês", French: "Francês", German: "Alemão", Hebrew: "Hebraico",
    Hindi: "Hindi", Italian: "Italiano", Japanese: "Japonês", Korean: "Coreano", Latin: "Latim", Mandarin: "Mandarim", Persian: "Persa", Portuguese: "Português",
    Russian: "Russo", Sinhala: "Cingalês", Sioux: "Sioux", Soninke: "Soninquê", Spanish: "Espanhol", Swedish: "Sueco", Tamil: "Tâmil", Tupi: "Tupi",
    Turkish: "Turco", Urdu: "Urdu", Wolof: "Uólofe",
};

export const formatLabel = (value: string) => {
    if (ptLabels[value]) return ptLabels[value];
    if (value === value.toLowerCase()) {
        const text = value.replace(/_/g, " ");
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    return value
        .split(" ")
        .map((word) => catalogWords[word] ?? word)
        .join(" ");
};

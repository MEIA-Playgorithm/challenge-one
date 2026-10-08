export const initials = (name: string) =>
    name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

const avatarTones = ["#6b5344", "#5a4a40", "#745848"];

export const avatarColor = (id: string) => {
    const index = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return avatarTones[index % avatarTones.length];
};

// The movie catalog stores names with punctuation stripped.
const catalogWords: Record<string, string> = {
    SciFi: "Sci-Fi",
    ComingofAge: "Coming-of-Age",
    HandDrawn: "Hand-Drawn",
    HighConcept: "High-Concept",
    OnePerson: "One-Person",
};

export const formatLabel = (value: string) => {
    if (value === value.toLowerCase()) {
        const text = value.replace(/_/g, " ");
        return text.charAt(0).toUpperCase() + text.slice(1);
    }
    return value
        .split(" ")
        .map((word) => catalogWords[word] ?? word)
        .join(" ");
};

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

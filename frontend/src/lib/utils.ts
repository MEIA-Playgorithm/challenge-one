export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const avatarColor = (id: number) => {
  const palette = [
    "#0F6E56",
    "#127A8A",
    "#1A6B4A",
    "#0E7490",
    "#146C5C",
    "#155E75",
    "#0D7377",
    "#1F6F5B",
    "#0F766E",
    "#1A5276",
    "#166534",
    "#115E59",
    "#134E4A",
    "#1E4D6B",
    "#0B6E4F",
  ];
  return palette[id % palette.length];
};

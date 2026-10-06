export const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const avatarColor = (id: number) => {
  const palette = [
    "#1B4D3E",
    "#C45C26",
    "#2C5F8A",
    "#8B4513",
    "#3D5A80",
    "#6A4C93",
    "#1982C4",
    "#8AC926",
    "#FFCA3A",
    "#FF595E",
    "#5E548E",
    "#9A031E",
    "#2A9D8F",
    "#E76F51",
    "#264653",
  ];
  return palette[id % palette.length];
};

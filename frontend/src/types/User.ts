export type User = {
  id: number;
  name: string;
  age: number;
  preferredLanguages: string[];
  excludedLanguages: string[];
  preferredGenres: string[];
  excludedGenres: string[];
  minRating?: number;
  yearFrom?: number;
  yearTo?: number;
  maxDuration?: number;
};

export const emptyUserFields = (): Omit<User, "id"> => ({
  name: "",
  age: 0,
  preferredLanguages: [],
  excludedLanguages: [],
  preferredGenres: [],
  excludedGenres: [],
});

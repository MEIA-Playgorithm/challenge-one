import {
  AUDIENCES,
  EMOTIONAL_TONES,
  ERAS,
  LEVELS,
  PACES,
  POPULARITIES,
  THEMES,
  emptyLimits,
  type User,
  type UserLimits,
  type UserPreferences,
  type WatchedMovie,
} from "../types/User";

const BASE_COLUMNS = [
  "user_id",
  "age",
  "watched",
  "wishlist",
  "preferred_genres",
  "disliked_genres",
  "preferred_languages",
  "disliked_languages",
] as const;

const PREFERENCE_COLUMNS: Record<string, keyof UserPreferences> = {
  preferred_directors: "director",
  preferred_writers: "writer",
  preferred_stars: "star",
  preferred_countries: "country_origin",
  preferred_subgenres: "subgenre",
  preferred_pace: "pace",
  preferred_complexity: "complexity",
  preferred_violence: "violence",
  preferred_humor: "humor",
  preferred_psychological_intensity: "psychological_intensity",
  preferred_emotional_tones: "emotional_tone",
  preferred_themes: "themes",
  preferred_audience: "audience",
  preferred_eras: "era",
  preferred_popularity: "popularity",
};

const LIMIT_COLUMNS = new Set([
  "allow_rewatch",
  "max_duration_minutes",
  "year_from",
  "year_to",
  "required_languages",
  "disliked_directors",
  "disliked_stars",
  "session_min_age",
  "min_rating",
  "rating_tolerance",
  "rating_required",
]);

function cell(row: Record<string, string>, key: string) {
  return row[key] ?? "";
}

function parts(text: string) {
  return text
    .split("|")
    .map((part) => part.trim().replace(/\s+/g, " "))
    .filter((part) => part !== "");
}

function genres(text: string) {
  return parts(text).map((value) => (value === "Sci-Fi" ? "SciFi" : value));
}

function enumParts<T extends string>(text: string, allowed: readonly T[], column: string): T[] {
  return parts(text).map((value) => {
    if (!allowed.includes(value as T)) throw new Error(`${column}: ${value}`);
    return value as T;
  });
}

function integer(text: string, min: number, max: number, column: string) {
  const trimmed = text.trim();
  if (trimmed === "") return undefined;
  if (!/^-?\d+$/.test(trimmed)) throw new Error(`${column}: ${text}`);
  const value = Number(trimmed);
  if (value < min || value > max) throw new Error(`${column}: ${text}`);
  return value;
}

function decimal(text: string, min: number, max: number, column: string) {
  const trimmed = text.trim();
  if (trimmed === "") return undefined;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < min || value > max) throw new Error(`${column}: ${text}`);
  return value;
}

function flag(text: string, column: string) {
  const trimmed = text.trim();
  if (trimmed === "") return undefined;
  if (trimmed !== "true" && trimmed !== "false") throw new Error(`${column}: ${text}`);
  return trimmed === "true";
}

function watchedMovies(text: string): WatchedMovie[] {
  const entries = parts(text).map((entry) => {
    const pieces = entry.split("=");
    if (pieces.length === 1) {
      if (pieces[0] === "") throw new Error(`watched: ${entry}`);
      return { movie_id: pieces[0], rating: 0 };
    }
    if (pieces.length !== 2) throw new Error(`watched: ${entry}`);
    const rating = integer(pieces[1], 0, 5, "watched");
    if (pieces[0] === "" || rating == null) throw new Error(`watched: ${entry}`);
    return { movie_id: pieces[0], rating };
  });
  const ids = entries.map((entry) => entry.movie_id);
  if (new Set(ids).size !== ids.length) throw new Error(`watched: ${text}`);
  return entries;
}

function preferences(row: Record<string, string>): UserPreferences {
  return {
    director: parts(cell(row, "preferred_directors")),
    writer: parts(cell(row, "preferred_writers")),
    star: parts(cell(row, "preferred_stars")),
    country_origin: parts(cell(row, "preferred_countries")),
    subgenre: parts(cell(row, "preferred_subgenres")),
    pace: enumParts(cell(row, "preferred_pace"), PACES, "preferred_pace"),
    complexity: enumParts(cell(row, "preferred_complexity"), LEVELS, "preferred_complexity"),
    violence: enumParts(cell(row, "preferred_violence"), LEVELS, "preferred_violence"),
    humor: enumParts(cell(row, "preferred_humor"), LEVELS, "preferred_humor"),
    psychological_intensity: enumParts(
      cell(row, "preferred_psychological_intensity"),
      LEVELS,
      "preferred_psychological_intensity",
    ),
    emotional_tone: enumParts(cell(row, "preferred_emotional_tones"), EMOTIONAL_TONES, "preferred_emotional_tones"),
    themes: enumParts(cell(row, "preferred_themes"), THEMES, "preferred_themes"),
    audience: enumParts(cell(row, "preferred_audience"), AUDIENCES, "preferred_audience"),
    era: enumParts(cell(row, "preferred_eras"), ERAS, "preferred_eras"),
    popularity: enumParts(cell(row, "preferred_popularity"), POPULARITIES, "preferred_popularity"),
  };
}

function limits(row: Record<string, string>): UserLimits {
  const result = emptyLimits();
  const maxDuration = integer(cell(row, "max_duration_minutes"), 1, 1440, "max_duration_minutes");
  const yearFrom = integer(cell(row, "year_from"), 1800, 3000, "year_from");
  const yearTo = integer(cell(row, "year_to"), 1800, 3000, "year_to");
  const sessionAge = integer(cell(row, "session_min_age"), 0, 120, "session_min_age");
  const minRating = decimal(cell(row, "min_rating"), 0, 10, "min_rating");
  const tolerance = decimal(cell(row, "rating_tolerance"), 0, 10, "rating_tolerance");
  const ratingRequired = flag(cell(row, "rating_required"), "rating_required");
  const rewatch = flag(cell(row, "allow_rewatch"), "allow_rewatch");
  if (yearFrom != null && yearTo != null && yearFrom > yearTo) throw new Error(`year_interval: ${yearFrom}-${yearTo}`);
  if ((tolerance != null || ratingRequired != null) && minRating == null) {
    throw new Error(`rating_options_without_minimum: ${cell(row, "user_id")}`);
  }
  if (maxDuration != null) result.max_duration_minutes = maxDuration;
  if (yearFrom != null) result.year_from = yearFrom;
  if (yearTo != null) result.year_to = yearTo;
  if (sessionAge != null) result.session_min_age = sessionAge;
  if (minRating != null) result.min_rating = minRating;
  if (tolerance != null) result.rating_tolerance = tolerance;
  if (ratingRequired != null) result.rating_required = ratingRequired;
  if (rewatch != null) result.allow_rewatch = rewatch;
  result.required_languages = parts(cell(row, "required_languages"));
  result.disliked_directors = parts(cell(row, "disliked_directors"));
  result.disliked_stars = parts(cell(row, "disliked_stars"));
  return result;
}

export function userFromColumns(row: Record<string, string>): User {
  const userId = cell(row, "user_id").trim();
  if (userId === "") throw new Error("user_id");
  const age = integer(cell(row, "age"), 0, 120, "age");
  return {
    user_id: userId,
    ...(age !== undefined ? { age } : {}),
    watched: watchedMovies(cell(row, "watched")),
    wishlist: parts(cell(row, "wishlist")),
    likes_genre: genres(cell(row, "preferred_genres")),
    dislikes_genre: genres(cell(row, "disliked_genres")),
    likes_language: parts(cell(row, "preferred_languages")),
    dislikes_language: parts(cell(row, "disliked_languages")),
    prefers: preferences(row),
    limits: limits(row),
  };
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  const pushRow = () => {
    row.push(value);
    value = "";
    if (row.some((item) => item !== "")) rows.push(row);
    row = [];
  };
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          value += '"';
          index += 1;
        } else quoted = false;
      } else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[index + 1] === "\n") index += 1;
      pushRow();
    } else value += char;
  }
  if (value !== "" || row.length > 0) pushRow();
  return rows;
}

export function usersFromCsv(text: string): User[] {
  const [header, ...records] = parseCsv(text);
  if (!header) throw new Error("user_csv_header");
  const base = header.slice(0, BASE_COLUMNS.length);
  if (base.some((column, index) => column !== BASE_COLUMNS[index])) throw new Error("user_csv_header");
  const extra = header.slice(BASE_COLUMNS.length);
  if (new Set(extra).size !== extra.length) throw new Error("user_csv_header");
  for (const column of extra) {
    if (!PREFERENCE_COLUMNS[column] && !LIMIT_COLUMNS.has(column)) throw new Error(`user_csv_header: ${column}`);
  }
  const users = records.map((record) => {
    if (record.length !== header.length) throw new Error("user_csv_row");
    const row: Record<string, string> = {};
    header.forEach((column, index) => {
      row[column] = record[index];
    });
    return userFromColumns(row);
  });
  const ids = users.map((user) => user.user_id);
  if (new Set(ids).size !== ids.length) throw new Error("unique_user_ids");
  return users;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringList(value: unknown) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return null;
  return value;
}

function enumList<T extends string>(value: unknown, allowed: readonly T[]) {
  const list = stringList(value);
  if (!list || list.some((item) => !allowed.includes(item as T))) return null;
  return list as T[];
}

function optionalInteger(value: unknown, min: number, max: number) {
  if (value == null) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) return null;
  return value;
}

function optionalDecimal(value: unknown, min: number, max: number) {
  if (value == null) return undefined;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) return null;
  return value;
}

function optionalFlag(value: unknown) {
  if (value == null) return undefined;
  if (typeof value !== "boolean") return null;
  return value;
}

function watchedList(value: unknown): WatchedMovie[] | null {
  if (!Array.isArray(value)) return null;
  const entries: WatchedMovie[] = [];
  for (const item of value) {
    if (!isRecord(item) || typeof item.movie_id !== "string" || item.movie_id === "") return null;
    if (typeof item.rating !== "number" || !Number.isInteger(item.rating) || item.rating < 0 || item.rating > 5) return null;
    entries.push({ movie_id: item.movie_id, rating: item.rating });
  }
  const ids = entries.map((entry) => entry.movie_id);
  if (new Set(ids).size !== ids.length) return null;
  return entries;
}

function preferenceObject(value: unknown): UserPreferences | null {
  if (!isRecord(value)) return null;
  const director = stringList(value.director);
  const writer = stringList(value.writer);
  const star = stringList(value.star);
  const countryOrigin = stringList(value.country_origin);
  const subgenre = stringList(value.subgenre);
  const pace = enumList(value.pace, PACES);
  const complexity = enumList(value.complexity, LEVELS);
  const violence = enumList(value.violence, LEVELS);
  const humor = enumList(value.humor, LEVELS);
  const psychologicalIntensity = enumList(value.psychological_intensity, LEVELS);
  const emotionalTone = enumList(value.emotional_tone, EMOTIONAL_TONES);
  const themes = enumList(value.themes, THEMES);
  const audience = enumList(value.audience, AUDIENCES);
  const era = enumList(value.era, ERAS);
  const popularity = enumList(value.popularity, POPULARITIES);
  if (
    !director ||
    !writer ||
    !star ||
    !countryOrigin ||
    !subgenre ||
    !pace ||
    !complexity ||
    !violence ||
    !humor ||
    !psychologicalIntensity ||
    !emotionalTone ||
    !themes ||
    !audience ||
    !era ||
    !popularity
  ) {
    return null;
  }
  return {
    director,
    writer,
    star,
    country_origin: countryOrigin,
    subgenre,
    pace,
    complexity,
    violence,
    humor,
    psychological_intensity: psychologicalIntensity,
    emotional_tone: emotionalTone,
    themes,
    audience,
    era,
    popularity,
  };
}

function limitObject(value: unknown, userId: string): UserLimits | null {
  if (!isRecord(value)) return null;
  const requiredLanguages = stringList(value.required_languages);
  const dislikedDirectors = stringList(value.disliked_directors);
  const dislikedStars = stringList(value.disliked_stars);
  if (!requiredLanguages || !dislikedDirectors || !dislikedStars) return null;
  const maxDuration = optionalInteger(value.max_duration_minutes, 1, 1440);
  const yearFrom = optionalInteger(value.year_from, 1800, 3000);
  const yearTo = optionalInteger(value.year_to, 1800, 3000);
  const sessionAge = optionalInteger(value.session_min_age, 0, 120);
  const minRating = optionalDecimal(value.min_rating, 0, 10);
  const tolerance = optionalDecimal(value.rating_tolerance, 0, 10);
  const ratingRequired = optionalFlag(value.rating_required);
  const rewatch = optionalFlag(value.allow_rewatch);
  if (
    maxDuration === null ||
    yearFrom === null ||
    yearTo === null ||
    sessionAge === null ||
    minRating === null ||
    tolerance === null ||
    ratingRequired === null ||
    rewatch === null
  ) {
    return null;
  }
  if (yearFrom != null && yearTo != null && yearFrom > yearTo) return null;
  if ((tolerance != null || ratingRequired != null) && minRating == null) return null;
  if (userId === "") return null;
  const result = emptyLimits();
  result.required_languages = requiredLanguages;
  result.disliked_directors = dislikedDirectors;
  result.disliked_stars = dislikedStars;
  if (maxDuration != null) result.max_duration_minutes = maxDuration;
  if (yearFrom != null) result.year_from = yearFrom;
  if (yearTo != null) result.year_to = yearTo;
  if (sessionAge != null) result.session_min_age = sessionAge;
  if (minRating != null) result.min_rating = minRating;
  if (tolerance != null) result.rating_tolerance = tolerance;
  if (ratingRequired != null) result.rating_required = ratingRequired;
  if (rewatch != null) result.allow_rewatch = rewatch;
  return result;
}

export function parseUserProfile(value: unknown): User | null {
  if (!isRecord(value) || typeof value.user_id !== "string" || value.user_id === "") return null;
  const age = optionalInteger(value.age, 0, 120);
  const watched = watchedList(value.watched);
  const wishlist = stringList(value.wishlist);
  const likesGenre = stringList(value.likes_genre);
  const dislikesGenre = stringList(value.dislikes_genre);
  const likesLanguage = stringList(value.likes_language);
  const dislikesLanguage = stringList(value.dislikes_language);
  const prefers = preferenceObject(value.prefers);
  const userLimits = limitObject(value.limits, value.user_id);
  if (
    age === null ||
    !watched ||
    !wishlist ||
    !likesGenre ||
    !dislikesGenre ||
    !likesLanguage ||
    !dislikesLanguage ||
    !prefers ||
    !userLimits
  ) {
    return null;
  }
  return {
    user_id: value.user_id,
    ...(age !== undefined ? { age } : {}),
    watched,
    wishlist,
    likes_genre: likesGenre,
    dislikes_genre: dislikesGenre,
    likes_language: likesLanguage,
    dislikes_language: dislikesLanguage,
    prefers,
    limits: userLimits,
  };
}

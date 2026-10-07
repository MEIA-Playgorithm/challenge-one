import { useEffect, useState } from "react";
import type { Movie } from "../types/Movie";
import { listMovies } from "./inference";

let catalogRequest: Promise<Movie[]> | null = null;

function loadCatalog() {
  catalogRequest ??= listMovies()
    .then((data) => data.items)
    .catch((error: unknown) => {
      catalogRequest = null;
      throw error;
    });
  return catalogRequest;
}

export function useCatalog() {
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadCatalog()
      .then((items) => {
        if (active) setMovies(items);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setMovies([]);
        setError(err instanceof Error ? err.message : "Request failed");
      });
    return () => {
      active = false;
    };
  }, []);

  return { movies: movies ?? [], loading: movies === null, error };
}

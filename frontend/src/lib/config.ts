export type EngineId = "prolog" | "drools";

type Config = {
    knowledgeBaseUrl: string;
    engines: Record<EngineId, { label: string; baseUrl: string }>;
};

// Lido de /config.json antes de a aplicação arrancar (ver main.tsx). Em Docker,
// o ficheiro é montado como volume, por isso muda-se sem reconstruir a imagem.
export let config: Config;

export async function loadConfig() {
    const response = await fetch("/config.json");
    if (!response.ok) throw new Error(`Could not load config.json (HTTP ${response.status})`);
    config = await response.json();
}

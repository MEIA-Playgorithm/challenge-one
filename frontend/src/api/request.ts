type Service = { label: string; baseUrl: string };

// Pedido a um serviço (motor ou knowledge base). Devolve a resposta se for OK;
// caso contrário lança um Error com a mensagem da API.
export async function request(service: Service, path: string, init: RequestInit = {}) {
    let response: Response;
    try {
        response = await fetch(`${service.baseUrl}${path}`, init);
    } catch (err) {
        if (init.signal?.aborted) throw err;
        throw new Error(`${service.label} não está acessível`);
    }
    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? `${service.label}: HTTP ${response.status}`);
    }
    return response;
}

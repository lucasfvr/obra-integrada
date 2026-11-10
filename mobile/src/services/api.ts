const configuredUrl = (process.env.EXPO_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message: string, public status: number | null = null) {
    super(message);
    this.name = 'ApiError';
  }
}

function apiBase(): string {
  if (!configuredUrl) {
    throw new ApiError('Configure EXPO_PUBLIC_API_URL no arquivo .env antes de usar o aplicativo.');
  }
  if (!/^https?:\/\//i.test(configuredUrl)) {
    throw new ApiError('EXPO_PUBLIC_API_URL deve começar com https:// (ou http:// somente em desenvolvimento).');
  }
  if (!__DEV__ && !/^https:\/\//i.test(configuredUrl)) {
    throw new ApiError('A API precisa utilizar HTTPS fora do ambiente de desenvolvimento.');
  }
  return configuredUrl.endsWith('/api') ? configuredUrl : configuredUrl + '/api';
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  let json: any = null;
  try { json = body ? JSON.parse(body) : null; } catch { /* resposta inesperada */ }
  if (!response.ok) {
    const text = json?.erro || json?.message;
    throw new ApiError(typeof text === 'string' ? text : 'Falha ao comunicar com o servidor.', response.status);
  }
  if (json === null && body) throw new ApiError('O servidor retornou uma resposta inesperada.', response.status);
  return json as T;
}

export async function apiRequest<T>(
  route: string,
  options: { token?: string; method?: 'GET' | 'POST' | 'PUT' | 'PATCH'; json?: unknown; form?: FormData } = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.token) headers.Authorization = 'Bearer ' + options.token;
    if (options.json !== undefined) headers['Content-Type'] = 'application/json';
    // Em upload multipart, deixar o fetch definir boundary automaticamente.
    const response = await fetch(apiBase() + route, {
      method: options.method || 'GET',
      headers,
      body: options.form || (options.json === undefined ? undefined : JSON.stringify(options.json)),
      signal: controller.signal
    });
    return await readResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError('Tempo esgotado. Confira o histórico antes de tentar enviar novamente.');
    throw new ApiError('Sem conexão com a API. Confira sua rede e a URL configurada.');
  } finally {
    clearTimeout(timeout);
  }
}

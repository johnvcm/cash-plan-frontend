// HARDCODED - IP Público para acesso remoto
const API_BASE_URL = "http://189.12.0.174:8080";

console.log("🌐 API Base URL:", API_BASE_URL);

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  baseUrl: API_BASE_URL,

  async fetch(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });

    // Se receber 401 (não autorizado), redireciona para login
    if (response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Se a resposta for 204 No Content, não tenta parsear JSON
    if (response.status === 204) {
      return null;
    }

    // Verifica se há conteúdo antes de tentar parsear
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return response.json();
    }

    return null;
  },

  async get(endpoint: string) {
    return this.fetch(endpoint, { method: "GET" });
  },

  async post(endpoint: string, data: unknown) {
    return this.fetch(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async put(endpoint: string, data: unknown) {
    return this.fetch(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async patch(endpoint: string, data: unknown) {
    return this.fetch(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  async delete(endpoint: string) {
    return this.fetch(endpoint, { method: "DELETE" });
  },
};

export default api;


/**
 * api.js
 * 
 * Centraliza a base URL da API.
 * Em desenvolvimento, usa localhost:5000.
 * Em produção, usa a variável de ambiente VITE_API_URL.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default API_BASE_URL;

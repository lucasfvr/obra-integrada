/**
 * storageService.js
 *
 * Abstração de storage para uploads de arquivo.
 * Hoje usa ARMAZENAMENTO LOCAL (/uploads).
 *
 * Para migrar para S3/R2 no futuro:
 *   1. Instale o SDK desejado (ex: @aws-sdk/client-s3)
 *   2. Implemente as funções abaixo usando o SDK
 *   3. Altere a variável STORAGE_PROVIDER no .env para "s3"
 *   4. O banco de dados NÃO precisa de nenhuma alteração
 *
 * O campo foto_url no banco sempre armazenará um PATH relativo ou URL absoluta,
 * transparente ao provider escolhido.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Diretório raiz de uploads (relativo à raiz do backend)
export const UPLOADS_DIR = path.resolve(__dirname, '..', '..', 'uploads');

// Garante que a pasta /uploads existe ao iniciar
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Retorna a URL pública de um arquivo dado seu caminho relativo.
 * Em modo local: /uploads/diario/<filename>
 * Em modo S3: https://bucket.s3.amazonaws.com/<key>
 *
 * @param {string} relativePath - Ex: "diario/uuid-timestamp.jpg"
 * @returns {string} URL acessível pelo frontend
 */
export function getPublicUrl(relativePath) {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 's3') {
    // Futuramente: return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${relativePath}`;
    throw new Error('S3 provider ainda não implementado. Configure STORAGE_PROVIDER=local.');
  }

  // Local: retorna caminho relativo para ser servido pelo Express como estático
  return `/uploads/${relativePath}`;
}

/**
 * Deleta um arquivo do storage.
 * @param {string} relativePath - Ex: "diario/uuid-timestamp.jpg"
 */
export async function deleteFile(relativePath) {
  const provider = process.env.STORAGE_PROVIDER || 'local';

  if (provider === 's3') {
    // Futuramente: lógica de delete no S3
    throw new Error('S3 provider ainda não implementado.');
  }

  const absolutePath = path.join(UPLOADS_DIR, relativePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

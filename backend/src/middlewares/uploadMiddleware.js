/**
 * uploadMiddleware.js
 *
 * Middleware de upload de arquivos usando Multer.
 * - Valida tipo MIME (apenas imagens)
 * - Limita tamanho (5MB por arquivo)
 * - Nomeia arquivos de forma única (uuid + timestamp)
 * - Organiza arquivos por subpasta (ex: /uploads/diario/)
 */

import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UPLOADS_DIR } from '../config/storageService.js';
import fs from 'fs';

// ─── Tipos MIME permitidos ──────────────────────────────────────────────────
const TIPOS_IMAGEM = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TIPOS_DOC    = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const EXTENSOES_IMAGEM = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
const EXTENSOES_DOC    = ['.pdf', '.doc', '.docx'];

// ─── Tamanho máximo: 10MB para documentos, 5MB para imagens ─────────────────
const TAMANHO_MAX_IMG = 5 * 1024 * 1024;
const TAMANHO_MAX_DOC = 10 * 1024 * 1024;

/**
 * Cria um middleware de upload configurado para uma subpasta específica.
 *
 * @param {string} subpasta - Ex: "diario" → arquivos salvos em /uploads/diario/
 * @returns Middleware Multer configurado
 */
export function criarUploadMiddleware(subpasta = 'geral') {
  const destino = path.join(UPLOADS_DIR, subpasta);
  const isDoc = subpasta === 'documentos';

  // Garante que a subpasta existe
  if (!fs.existsSync(destino)) {
    fs.mkdirSync(destino, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destino);
    },

    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const timestamp = Date.now();
      const uuid = uuidv4().replace(/-/g, '').slice(0, 12);
      const nomeUnico = `${subpasta}-${uuid}-${timestamp}${ext}`;
      cb(null, nomeUnico);
    },
  });

  const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    
    const tiposPermitidos = isDoc ? [...TIPOS_IMAGEM, ...TIPOS_DOC] : TIPOS_IMAGEM;
    const extensoesPermitidas = isDoc ? [...EXTENSOES_IMAGEM, ...EXTENSOES_DOC] : EXTENSOES_IMAGEM;

    const mimeValido = tiposPermitidos.includes(file.mimetype);
    const extValida = extensoesPermitidas.includes(ext);

    if (!mimeValido || !extValida) {
      return cb(
        new Error(
          `Tipo de arquivo não permitido. Aceitos: ${extensoesPermitidas.join(', ')}`
        ),
        false
      );
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: isDoc ? TAMANHO_MAX_DOC : TAMANHO_MAX_IMG,
      files: 1,
    },
  });
}

/**
 * Handler de erros de upload — centraliza as mensagens de erro do Multer.
 * Usar como middleware DEPOIS do multer:
 *   router.post('/rota', upload.single('foto'), handleUploadError, controller)
 */
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        erro: `Arquivo muito grande. Tamanho máximo: 5MB.`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        erro: 'Envie apenas 1 arquivo por vez.',
      });
    }
    return res.status(400).json({ erro: `Erro no upload: ${err.message}` });
  }

  if (err) {
    return res.status(400).json({ erro: err.message });
  }

  next();
}

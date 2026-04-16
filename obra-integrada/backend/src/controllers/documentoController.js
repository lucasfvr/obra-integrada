/**
 * documentoController.js
 *
 * Gerenciamento de documentos da obra (Upload e Listagem).
 */

import prisma from '../config/prisma.js';
import { getPublicUrl } from '../config/storageService.js';

/**
 * Realiza o upload de um documento para uma obra
 */
export async function uploadDocumento(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);
    const { nome, tipo } = req.body;

    if (!req.file) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const finalNome = nome || req.file.originalname;
    const url = getPublicUrl(`documentos/${req.file.filename}`);

    const novoDocumento = await prisma.tb_documento.create({
      data: {
        id_obra: idObra,
        nome: finalNome,
        tipo: tipo || req.file.mimetype,
        url: url,
      },
    });

    return res.status(201).json({
      mensagem: 'Documento enviado com sucesso!',
      documento: novoDocumento,
    });
  } catch (error) {
    console.error('[DOCUMENTO] Erro no upload:', error);
    return res.status(500).json({ erro: 'Erro ao salvar documento no banco de dados' });
  }
}

/**
 * Lista documentos de uma obra (Opcional se nao usar a API hidratada)
 */
export async function listarDocumentos(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);

    const documentos = await prisma.tb_documento.findMany({
      where: { id_obra: idObra },
      orderBy: { data_upload: 'desc' },
    });

    return res.status(200).json(documentos);
  } catch (error) {
    console.error('[DOCUMENTO] Erro ao listar:', error);
    return res.status(500).json({ erro: 'Erro ao buscar documentos' });
  }
}

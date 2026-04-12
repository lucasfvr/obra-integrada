import { ObraModel } from '../models/obra.js';

/**
 * Lista apenas as obras do usuário que fez a requisição
 */
export async function listarObras(req, res) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ erro: 'ID do usuário é obrigatório' });
    }
    const obras = await ObraModel.findByUserId(userId);
    res.status(200).json(obras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao listar obras' });
  }
}

/**
 * Cria uma nova obra e a vincula ao usuário
 */
export async function criarObra(req, res) {
  try {
    const { 
      nome_obra, nome, tipo_obra, userId, id_status,
      cep, logradouro, numero, bairro, cidade, estado,
      latitude, longitude, data_inicio, previsao_termino,
      valor_orcado, custo_atual, observacoes
    } = req.body;

    const finalNome = nome_obra || nome;
    if (!finalNome || !userId) {
      return res.status(400).json({ erro: 'Nome da obra e ID do usuário são obrigatórios' });
    }

    const novaObra = await ObraModel.create({
      nome: finalNome,
      tipo_obra,
      cep, logradouro, numero, bairro, cidade, estado,
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
      data_inicio: data_inicio ? new Date(data_inicio) : null,
      previsao_termino: previsao_termino ? new Date(previsao_termino) : null,
      valor_orcado: valor_orcado ? Number(valor_orcado) : null,
      custo_atual: custo_atual ? Number(custo_atual) : null,
      observacoes,
      id_usuario_responsavel: Number(userId),
      id_status: id_status ? Number(id_status) : 1,
    });

    res.status(201).json(novaObra);
  } catch (error) {
    console.error("Erro ao criar obra:", error);
    res.status(500).json({ erro: 'Erro ao criar obra', detalhe: error.message });
  }
}


export async function atualizarObra(req, res) {
  try {
    const { id } = req.params;
    const obraAtualizada = await ObraModel.update(Number(id), req.body);
    if (!obraAtualizada) {
      return res.status(404).json({ erro: 'Obra não encontrada' });
    }
    res.status(200).json(obraAtualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar obra' });
  }
}


export async function deletarObra(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const obra = await ObraModel.findById(Number(id));
    if (!obra) {
      return res.status(404).json({ erro: 'Obra não encontrada' });
    }

    if (obra.id_usuario_responsavel !== Number(userId)) {
      return res.status(403).json({ erro: 'Acesso negado.' });
    }

    await ObraModel.delete(Number(id));
    res.status(200).json({ mensagem: 'Obra removida com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao deletar obra' });
  }
}

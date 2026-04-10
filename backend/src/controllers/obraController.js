import { ObraModel } from '../models/obra.js';

/**
 * Lista apenas as obras do usuário que fez a requisição
 */
export async function listarObras(req, res) {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ erro: "ID do usuário é obrigatório" });
        }
        const obras = await ObraModel.findByUserId(userId);
        res.status(200).json(obras);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar obras" });
    }
}

/**
 * Cria uma nova obra e a vincula ao usuário
 */
export async function criarObra(req, res) {
    try {
        const { nome_obra, userId } = req.body;
        if (!nome_obra || !userId) {
            return res.status(400).json({ erro: "Nome da obra e ID do usuário são obrigatórios" });
        }
        const obras = await ObraModel.findAll();
        const id = obras.length ? Math.max(...obras.map(o => o.id_obra)) + 1 : 1;
        
        const novaObra = {
            id_obra: id,
            nome_obra: nome_obra,
            status: "Planejada",
            userId: userId
        };

        await ObraModel.create(novaObra);
        res.status(201).json(novaObra);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar obra" });
    }
}

/**
 * Atualiza uma obra existente
 */
export async function atualizarObra(req, res) {
    try {
        const { id } = req.params;
        const obraAtualizada = await ObraModel.update(Number(id), req.body);
        if (!obraAtualizada) {
            return res.status(404).json({ erro: "Obra não encontrada" });
        }
        res.status(200).json(obraAtualizada);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar obra" });
    }
}

export async function deletarObra(req, res) {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const obra = await ObraModel.findById(Number(id));
        if (!obra) {
            return res.status(404).json({ erro: "Obra não encontrada" });
        }
        
        if (obra.userId !== userId) {
            return res.status(403).json({ erro: "Acesso negado." });
        }

        await ObraModel.delete(Number(id));
        res.status(200).json({ mensagem: "Obra removida com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar obra" });
    }
}
import { ObraModel } from '../models/obra.js';

/**
 * Lista apenas as obras do usuário autenticado (pelo token JWT)
 */
export async function listarObras(req, res) {
    try {
        const userId = req.user.id; // vem do token

        const obras = await ObraModel.findByUserId(userId);

        res.status(200).json(obras);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao listar obras" });
    }
}

/**
 * Cria uma nova obra vinculada automaticamente ao usuário do token
 */
export async function criarObra(req, res) {
    try {
        const { nome_obra } = req.body;
        const userId = req.user.id; // vem do token

        if (!nome_obra) {
            return res.status(400).json({ erro: "Nome da obra é obrigatório" });
        }

        const obras = await ObraModel.findAll();
        const id = obras.length ? Math.max(...obras.map(o => o.id_obra)) + 1 : 1;

        const novaObra = {
            id_obra: id,
            nome_obra,
            status: "Planejada",
            userId
        };

        await ObraModel.create(novaObra);

        res.status(201).json(novaObra);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao criar obra" });
    }
}

/**
 * Atualiza uma obra SOMENTE se ela pertencer ao usuário autenticado
 */
export async function atualizarObra(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const obra = await ObraModel.findById(Number(id));

        if (!obra) {
            return res.status(404).json({ erro: "Obra não encontrada" });
        }

        if (obra.userId !== userId) {
            return res.status(403).json({ erro: "Acesso negado" });
        }

        const obraAtualizada = await ObraModel.update(Number(id), req.body);

        res.status(200).json(obraAtualizada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao atualizar obra" });
    }
}

/**
 * Deleta uma obra SOMENTE se ela pertencer ao usuário autenticado
 */
export async function deletarObra(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const obra = await ObraModel.findById(Number(id));

        if (!obra) {
            return res.status(404).json({ erro: "Obra não encontrada" });
        }

        if (obra.userId !== userId) {
            return res.status(403).json({ erro: "Acesso negado" });
        }

        await ObraModel.delete(Number(id));

        res.status(200).json({ mensagem: "Obra removida com sucesso" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro ao deletar obra" });
    }
}

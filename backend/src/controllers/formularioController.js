import { UserModel } from '../models/user.js';

export async function atualizarPerfil(req, res) {
  try {
    const { id } = req.params;
    const dados = req.body;

    const atualizado = await UserModel.update(id, dados);
    return res.status(200).json({ mensagem: 'Perfil atualizado!', usuario: atualizado });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao atualizar perfil' });
  }
}

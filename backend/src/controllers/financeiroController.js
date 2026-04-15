import prisma from '../config/prisma.js';

/**
 * Lista todos os registros financeiros de uma obra
 */
export async function listarFinanceiro(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);
    const financeiro = await prisma.tb_financeiro_obra.findMany({
      where: { id_obra: idObra },
      include: {
        tb_usuario: { select: { nome: true } }
      },
      orderBy: { criado_em: 'desc' }
    });
    return res.status(200).json(financeiro);
  } catch (error) {
    console.error('[FINANCEIRO] Erro ao listar:', error);
    return res.status(500).json({ erro: 'Erro ao listar financeiro' });
  }
}

/**
 * Cria um novo registro financeiro
 */
export async function criarRegistroFinanceiro(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);
    const idUsuario = req.user.id;
    const { tipo, valor, descricao, data_vencimento, data_pagamento, numero_nota_fiscal } = req.body;

    if (!tipo || !valor) {
      return res.status(400).json({ erro: 'Tipo e valor sao obrigatorios' });
    }

    const novoRegistro = await prisma.tb_financeiro_obra.create({
      data: {
        id_obra: idObra,
        id_usuario: idUsuario,
        tipo,
        valor: Number(valor),
        descricao,
        data_vencimento: data_vencimento ? new Date(data_vencimento) : null,
        data_pagamento: data_pagamento ? new Date(data_pagamento) : null,
        numero_nota_fiscal,
        url_comprovante: req.file ? `financeiro/${req.file.filename}` : null
      }
    });

    return res.status(201).json(novoRegistro);
  } catch (error) {
    console.error('[FINANCEIRO] Erro ao criar:', error);
    return res.status(500).json({ erro: 'Erro ao criar registro financeiro' });
  }
}

/**
 * Deleta um registro financeiro
 */
export async function deletarRegistroFinanceiro(req, res) {
  try {
    const { financeiroId } = req.params;
    await prisma.tb_financeiro_obra.delete({
      where: { id_financeiro: Number(financeiroId) }
    });
    return res.status(200).json({ mensagem: 'Registro removido com sucesso' });
  } catch (error) {
    console.error('[FINANCEIRO] Erro ao deletar:', error);
    return res.status(500).json({ erro: 'Erro ao deletar registro financeiro' });
  }
}

/**
 * Retorna dados para a visão organizacional da empresa/obra
 */
export async function getOrgChart(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);

    // Busca a obra com responsavel e membros da equipe
    const obra = await prisma.tb_obra.findUnique({
      where: { id_obra: idObra },
      include: {
        tb_usuario: { // Responsável Técnico
          select: { id_usuario: true, nome: true, funcao: true, role: true }
        },
        tb_usuario_obra: {
          include: {
            tb_usuario: {
              select: { id_usuario: true, nome: true, funcao: true, role: true }
            }
          }
        },
        tb_obra_cliente: {
          include: {
            tb_cliente: {
              include: {
                tb_usuario: {
                  where: { role: 'PROPRIETARIO' },
                  select: { id_usuario: true, nome: true, funcao: true, role: true }
                }
              }
            }
          }
        }
      }
    });

    if (!obra) {
      return res.status(404).json({ erro: 'Obra nao encontrada' });
    }

    // Identifica o Proprietário da Empresa (Cliente)
    const proprietarios = obra.tb_obra_cliente.flatMap(v => v.tb_cliente.tb_usuario);

    const hierarquia = {
      id: 'org-root',
      nome: 'Empresa',
      children: proprietarios.map(prop => ({
        id: `prop-${prop.id_usuario}`,
        nome: prop.nome,
        funcao: 'Proprietário',
        role: prop.role,
        children: [
          {
            id: `resp-${obra.tb_usuario.id_usuario}`,
            nome: obra.tb_usuario.nome,
            funcao: obra.tb_usuario.funcao || 'Responsável Técnico',
            role: obra.tb_usuario.role,
            children: obra.tb_usuario_obra.map(item => ({
              id: `member-${item.tb_usuario.id_usuario}`,
              nome: item.tb_usuario.nome,
              funcao: item.tb_usuario.funcao || 'Membro da Equipe',
              role: item.tb_usuario.role
            }))
          }
        ]
      }))
    };

    return res.status(200).json(hierarquia);
  } catch (error) {
    console.error('[ORG] Erro ao buscar organograma:', error);
    return res.status(500).json({ erro: 'Erro ao carregar visão organizacional' });
  }
}

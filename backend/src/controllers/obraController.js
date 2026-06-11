import { ObraModel } from '../models/obra.js';
import prisma from '../config/prisma.js';

/**
 * Lista apenas as obras do usuário que fez a requisição
 */
export async function listarObras(req, res) {
  try {
    const { id: idUsuario, role, id_cliente } = req.user;
    console.log(`[DEBUG] listarObras called by id:${idUsuario}, role:${role}, cliente:${id_cliente}`);
    
    // REQUISITO B: Paginação
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    let queryOptions = {
      skip,
      take: limit,
      orderBy: { id_obra: 'desc' }
    };

    // 1. ADMIN_MASTER / PLATAFORMA → Vê todas as obras
    if (['ADMIN_MASTER', 'MASTER', 'ADMIN'].includes(role)) {
      const [obras, total] = await Promise.all([
        prisma.tb_obra.findMany({
          ...queryOptions,
          include: { tb_status: true }
        }),
        prisma.tb_obra.count()
      ]);
      
      return res.status(200).json({
        data: obras,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }


    // 2. PROPRIETARIO → Vê todas as obras da sua empresa (Multi-tenancy)
    if (role === 'PROPRIETARIO') {
      if (!id_cliente) {
        return res.status(403).json({ erro: 'Proprietario sem empresa vinculada' });
      }
      
      const filter = {
        tb_obra_cliente: { some: { id_cliente: Number(id_cliente) } }
      };

      const [obras, total] = await Promise.all([
        prisma.tb_obra.findMany({
          where: filter,
          ...queryOptions,
          include: { tb_status: true }
        }),
        prisma.tb_obra.count({ where: filter })
      ]);

      return res.status(200).json({
        data: obras,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      });
    }

    // 3. RESPONSAVEL / OUTROS → Vê obras onde está vinculado
    const filterResponsavel = {
      OR: [
        { id_usuario_responsavel: Number(idUsuario) },
        { tb_usuario_obra: { some: { id_usuario: Number(idUsuario) } } }
      ]
    };

    const [obras, total] = await Promise.all([
      prisma.tb_obra.findMany({
        where: filterResponsavel,
        ...queryOptions,
        include: { tb_status: true }
      }),
      prisma.tb_obra.count({ where: filterResponsavel })
    ]);

    return res.status(200).json({
      data: obras,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('[OBRA] Erro ao listar obras:', error);
    res.status(500).json({ erro: 'Erro ao buscar obra' });
  }
}

/**
 * Retorna a hierarquia da equipe para o OrgChart (Estilo Teams)
 */
export async function getOrgChart(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);

    const obra = await prisma.tb_obra.findUnique({
      where: { id_obra: idObra },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true, funcao: true, role: true } },
        tb_usuario_obra: {
          include: {
            tb_usuario: { select: { id_usuario: true, nome: true, funcao: true, role: true } },
            tb_papel: true
          }
        }
      }
    });

    if (!obra) {
      return res.status(404).json({ erro: 'Obra não encontrada' });
    }

    // Nível 1: Gestor/Responsável
    const root = {
      id: obra.tb_usuario.id_usuario,
      nome: obra.tb_usuario.nome,
      funcao: obra.tb_usuario.funcao || 'Gestor do Projeto',
      children: []
    };

    // Filtra Mestres (id_papel = 2) ou Engenheiros (id_papel = 3) para o Nível 2
    const lideres = obra.tb_usuario_obra.filter(m => [2, 3].includes(m.id_papel));
    const operacionais = obra.tb_usuario_obra.filter(m => ![2, 3].includes(m.id_papel));

    // Se houver líderes, eles ficam abaixo do root
    if (lideres.length > 0) {
      root.children = lideres.map(l => ({
        id: l.id_usuario,
        nome: l.tb_usuario.nome,
        funcao: l.tb_papel?.nome || 'Líder',
        children: operacionais.map(o => ({
          id: o.id_usuario,
          nome: o.tb_usuario.nome,
          funcao: o.tb_papel?.nome || 'Membro',
          children: []
        }))
      }));
    } else {
      // Se não houver líderes, todos ficam abaixo do root
      root.children = operacionais.map(o => ({
        id: o.id_usuario,
        nome: o.tb_usuario.nome,
        funcao: o.tb_papel?.nome || 'Membro',
        children: []
      }));
    }

    return res.json(root);
  } catch (error) {
    console.error('[OBRA] Erro no OrgChart:', error);
    res.status(500).json({ erro: 'Erro ao gerar organograma' });
  }
}

/**
 * Cria uma nova obra com dados técnicos, orçamento, equipe e estoque inicial usando $transaction
 */
export async function criarObra(req, res) {
  try {
    const { 
      nome_obra, nome, tipo_obra, userId, id_status,
      cep, logradouro, numero, bairro, cidade, estado,
      latitude, longitude, data_inicio, previsao_termino,
      valor_orcado, custo_atual, observacoes,
      // Novos campos técnicos e orçamento
      area_terreno, area_construida, numero_alvara, art_rrt,
      orcamento_material, orcamento_mao_obra, orcamento_taxas,
      // Arrays dinâmicos
      equipe = [], estoque = []
    } = req.body;

    const { id_cliente } = req.user; // Para vincular ao tenant corrente
    const finalNome = nome_obra || nome;
    
    if (!finalNome || !userId) {
      return res.status(400).json({ erro: 'Nome da obra e ID do usuário (Responsável) são obrigatórios' });
    }



    const novaObra = await prisma.$transaction(async (tx) => {
      // 1. Cria a obra base com todos os campos detalhados
      const obra = await tx.tb_obra.create({
        data: {
          nome: finalNome,
          tipo_obra,
          cep, logradouro, numero, bairro, cidade, estado,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          data_inicio: data_inicio ? new Date(data_inicio) : null,
          previsao_termino: previsao_termino ? new Date(previsao_termino) : null,
          valor_orcado: valor_orcado ? Number(valor_orcado) : null,
          custo_atual: custo_atual ? Number(custo_atual) : null,
          area_terreno: area_terreno ? Number(area_terreno) : null,
          area_construida: area_construida ? Number(area_construida) : null,
          numero_alvara,
          art_rrt,
          orcamento_material: orcamento_material ? Number(orcamento_material) : null,
          orcamento_mao_obra: orcamento_mao_obra ? Number(orcamento_mao_obra) : null,
          orcamento_taxas: orcamento_taxas ? Number(orcamento_taxas) : null,
          observacoes,
          id_usuario_responsavel: Number(userId),
          id_status: id_status ? Number(id_status) : 1,
        }
      });

      // 2. Vincula à empresa do proprietário/cliente logado (Multi-tenant)
      if (id_cliente) {
        await tx.tb_obra_cliente.create({
          data: {
            id_obra: obra.id_obra,
            id_cliente: Number(id_cliente)
          }
        });
      }

      // 3. Insere a Equipe Alocada
      if (equipe && equipe.length > 0) {
        // Encontra o tb_papel respectivo para cada função informada (Simplificando: se nao tiver tabela de papeis complexa, pode só assumir a coluna correta, mas req do db precisa de `id_papel` opcional)
        // No esquema atual do db temos `tb_papel`, mas a role tá tambem no user.
        // O tb_usuario_obra requer id_usuario e id_obra, id_papel é opcional.
        const equipeToInsert = equipe.map(m => ({
          id_obra: obra.id_obra,
          id_usuario: Number(m.id_usuario),
          valor_dia: m.valor_dia ? Number(m.valor_dia) : 0
        }));
        
        await tx.tb_usuario_obra.createMany({
          data: equipeToInsert,
          skipDuplicates: true
        });
      }

      // 4. Insere o Estoque Inicial
      if (estoque && estoque.length > 0) {
        const estoqueToInsert = estoque.map(item => ({
          id_obra: obra.id_obra,
          nome_material: item.nome_material,
          unidade_medida: item.unidade_medida || 'Unidade',
          quantidade: item.quantidade_inicial ? Number(item.quantidade_inicial) : 0
        }));

        await tx.tb_estoque_obra.createMany({
          data: estoqueToInsert
        });
      }

      return obra;
    });

    res.status(201).json(novaObra);
  } catch (error) {
    console.error("Erro ao criar obra (transaction):", error);
    res.status(500).json({ erro: 'Erro ao criar obra', detalhe: error.message });
  }
}



/**
 * Retorna os detalhes completos de uma obra (API Hidratada)
 * Respeita permissoes do usuario (filtra financeiro se necessario)
 */
export async function getObraById(req, res) {
  try {
    const idObra = req.obraAccess?.idObra || Number(req.params.id);
    const nivelAcesso = req.obraAccess?.nivelAcesso; // 'total' ou 'leitura'

    const obra = await ObraModel.findById(idObra);

    if (!obra) {
      return res.status(404).json({ erro: 'Obra nao encontrada' });
    }

    // ─── Filtragem por Permissao (RBAC) ───────────────────────────────────────
    // Se o acesso nao for 'total' (Responsavel/Admin/Master), removemos financeiro
    if (nivelAcesso !== 'total') {
      delete obra.valor_orcado;
      delete obra.custo_atual;
      // Adicionalmente, podemos marcar como read-only para o frontend
      obra._readOnly = true;
    }

    return res.status(200).json(obra);
  } catch (error) {
    console.error('[OBRA] Erro ao buscar detalhes:', error);
    return res.status(500).json({ erro: 'Erro ao buscar detalhes da obra' });
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

    const obra = await ObraModel.findById(Number(id));
    if (!obra) {
      return res.status(404).json({ erro: 'Obra não encontrada' });
    }

    // Deletar as relações que não possuem Cascade no Prisma (tb_usuario_obra, tb_etapa, tb_requisicao)
    // Usamos uma transação para garantir atomicidade
    await prisma.$transaction([
      prisma.tb_usuario_obra.deleteMany({ where: { id_obra: Number(id) } }),
      prisma.tb_etapa.deleteMany({ where: { id_obra: Number(id) } }),
      prisma.tb_requisicao.deleteMany({ where: { id_obra: Number(id) } }),
      // O restante (tarefas, financeiro, estoque, documentos, diario) já tem Cascade no schema
      prisma.tb_obra.delete({ where: { id_obra: Number(id) } })
    ]);

    res.status(200).json({ mensagem: 'Obra removida com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar obra:', error);
    res.status(500).json({ erro: 'Erro interno ao deletar obra' });
  }
}

// ─── GESTÃO DE EQUIPE (CRU-D) ────────────────────────────────────────────────
export async function adicionarMembroEquipe(req, res) {
  try {
    const { id: idObra } = req.params;
    const { id_usuario, id_papel, valor_dia } = req.body;
    const { id_cliente } = req.user;

    if (!id_usuario) {
      return res.status(400).json({ erro: 'O ID do usuário é obrigatório' });
    }

    // 1. Verificar se o usuário pertence à empresa (RH)
    // Se não houver id_cliente, permitimos se for ADMIN/MASTER, 
    // mas se for PROPRIETARIO/RESPONSAVEL, id_cliente é obrigatório.
    const filterRh = { id_usuario: Number(id_usuario) };
    if (id_cliente) {
      filterRh.id_cliente = Number(id_cliente);
    } else if (!['ADMIN', 'MASTER', 'ADMIN_MASTER'].includes(req.user.role)) {
       return res.status(403).json({ erro: 'Ação permitida apenas para usuários vinculados a uma empresa.' });
    }

    const usuarioNoRh = await prisma.tb_usuario.findFirst({
      where: filterRh
    });

    if (!usuarioNoRh) {
      return res.status(403).json({ erro: 'Este usuário não pertence ao seu RH e não pode ser adicionado à obra.' });
    }

    // 2. Criar vínculo
    const vinculo = await prisma.tb_usuario_obra.create({
      data: {
        id_obra: Number(idObra),
        id_usuario: Number(id_usuario),
        id_papel: id_papel ? Number(id_papel) : null,
        valor_dia: valor_dia ? Number(valor_dia) : 0
      }
    });

    res.status(201).json(vinculo);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ erro: 'Este colaborador já faz parte da equipe desta obra.' });
    }
    console.error('[OBRA] Erro ao adicionar membro:', error);
    res.status(500).json({ erro: 'Erro ao adicionar membro' });
  }
}

export async function removerMembroEquipe(req, res) {
  try {
    const { id: idObra, idUsuario } = req.params;

    await prisma.tb_usuario_obra.delete({
      where: {
        id_usuario_id_obra: {
          id_obra: Number(idObra),
          id_usuario: Number(idUsuario)
        }
      }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao remover membro' });
  }
}

export async function atualizarMembroEquipe(req, res) {
  try {
    const { id: idObra, idUsuario } = req.params;
    const { id_papel, valor_dia } = req.body;

    const membro = await prisma.tb_usuario_obra.update({
      where: {
        id_usuario_id_obra: {
          id_obra: Number(idObra),
          id_usuario: Number(idUsuario)
        }
      },
      data: {
        id_papel: id_papel ? Number(id_papel) : undefined,
        valor_dia: valor_dia !== undefined ? Number(valor_dia) : undefined
      }
    });

    res.status(200).json(membro);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar membro da equipe' });
  }
}

// ─── GESTÃO DE ESTOQUE (CRUD) ────────────────────────────────────────────────
export async function adicionarItemEstoque(req, res) {
  try {
    const { id: idObra } = req.params;
    const idUsuario = req.user.id;
    const { nome_material, unidade_medida, quantidade, valor_unidade, fornecedor } = req.body;

    const quantidadeNum = Number(quantidade || 0);

    const item = await prisma.tb_estoque_obra.create({
      data: {
        id_obra: Number(idObra),
        nome_material,
        unidade_medida: unidade_medida || 'Unidade',
        quantidade: quantidadeNum
      }
    });

    // Registrar histórico inicial se quantidade > 0
    if (quantidadeNum > 0) {
      const valorTotal = valor_unidade ? Number(valor_unidade) * quantidadeNum : 0;
      
      let idFinanceiro = null;
      if (valorTotal > 0) {
        const fin = await prisma.tb_financeiro_obra.create({
          data: {
            id_obra: Number(idObra),
            id_usuario: idUsuario,
            tipo: 'DESPESA',
            valor: valorTotal,
            descricao: `Compra inicial de ${nome_material}`,
            data_pagamento: new Date()
          }
        });
        idFinanceiro = fin.id_financeiro;
      }

      await prisma.tb_movimentacao_estoque.create({
        data: {
          id_estoque: item.id_estoque,
          id_usuario: idUsuario,
          tipo: 'ENTRADA',
          quantidade: quantidadeNum,
          origem_fornecedor: fornecedor,
          id_financeiro: idFinanceiro
        }
      });
    }

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao adicionar item ao estoque' });
  }
}

export async function removerItemEstoque(req, res) {
  try {
    const { idItem } = req.params;

    await prisma.tb_estoque_obra.delete({
      where: { id_estoque: Number(idItem) }
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao remover item do estoque' });
  }
}

export async function atualizarItemEstoque(req, res) {
  try {
    const { idItem } = req.params;
    const idUsuario = req.user.id;
    const { nome_material, unidade_medida, quantidade_nova, valor_total, fornecedor, justificativa } = req.body;

    // Buscar estado atual
    const itemAtual = await prisma.tb_estoque_obra.findUnique({
      where: { id_estoque: Number(idItem) }
    });

    if (!itemAtual) return res.status(404).json({ erro: 'Item nao encontrado' });

    const novaQuantidade = quantidade_nova !== undefined ? Number(quantidade_nova) : itemAtual.quantidade;
    const diff = Number(novaQuantidade) - Number(itemAtual.quantidade);

    const item = await prisma.tb_estoque_obra.update({
      where: { id_estoque: Number(idItem) },
      data: {
        nome_material,
        unidade_medida,
        quantidade: novaQuantidade
      }
    });

    // Se houve mudança na quantidade, registrar histórico
    if (diff !== 0) {
      let idFinanceiro = null;
      if (valor_total && diff > 0) {
        const fin = await prisma.tb_financeiro_obra.create({
          data: {
            id_obra: itemAtual.id_obra,
            id_usuario: idUsuario,
            tipo: 'DESPESA',
            valor: Number(valor_total),
            descricao: justificativa || `Compra de ${item.nome_material}`,
            data_pagamento: new Date()
          }
        });
        idFinanceiro = fin.id_financeiro;
      }

      await prisma.tb_movimentacao_estoque.create({
        data: {
          id_estoque: item.id_estoque,
          id_usuario: idUsuario,
          tipo: diff > 0 ? 'ENTRADA' : 'SAIDA',
          quantidade: Math.abs(diff),
          origem_fornecedor: fornecedor,
          id_financeiro: idFinanceiro
        }
      });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao atualizar item do estoque' });
  }
}

export async function listarHistoricoEstoque(req, res) {
  try {
    const { idItem } = req.params;
    const historico = await prisma.tb_movimentacao_estoque.findMany({
      where: { id_estoque: Number(idItem) },
      include: {
        tb_usuario: { select: { nome: true } }
      },
      orderBy: { data_registro: 'desc' }
    });
    return res.status(200).json(historico);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao buscar historico de estoque' });
  }
}

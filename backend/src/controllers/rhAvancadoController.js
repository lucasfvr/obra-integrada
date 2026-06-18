/**
 * rhAvancadoController.js
 * 
 * Controlador para Gestão RH Avançada (Multi-Tenant)
 * Módulo com acesso restrito apenas para role RH
 * 
 * Segue padrão de resposta standardizado:
 * { success: boolean, data: any, error: string | null }
 * 
 * REGRA CRÍTICA: Toda query deve filtrar por id_cliente para garantir isolamento multi-tenant
 */

import prisma from '../config/prisma.js';

/**
 * === SALÁRIOS ===
 */

export async function listarSalarios(req, res) {
  try {
    const { page = 1, limit = 10, busca = '', sortBy = 'nome', sortOrder = 'asc' } = req.query;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado no token JWT'
      });
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      id_cliente,
      tb_usuario: busca ? {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { email: { contains: busca, mode: 'insensitive' } }
        ]
      } : undefined
    };

    const orderDirection = sortOrder === 'desc' ? 'desc' : 'asc';
    const allowedSortFields = ['id_salario', 'salario_base', 'bonus', 'desconto', 'vale_refeicao', 'vale_transporte', 'data_inicio', 'data_fim', 'criado_em'];
    let orderByClause = { data_inicio: orderDirection };
    if (sortBy === 'nome') {
      orderByClause = { tb_usuario: { nome: orderDirection } };
    } else if (allowedSortFields.includes(sortBy)) {
      orderByClause = { [sortBy]: orderDirection };
    }

    const [salarios, total] = await Promise.all([
      prisma.tb_rh_salario.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: orderByClause,
        include: {
          tb_usuario: { select: { id_usuario: true, nome: true, email: true, matricula: true } }
        }
      }),
      prisma.tb_rh_salario.count({ where })
    ]);

    const totalEmFolha = await prisma.tb_rh_salario.aggregate({
      where: { id_cliente },
      _sum: { salario_base: true }
    });

    return res.status(200).json({
      success: true,
      data: salarios,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
        totalEmFolha: totalEmFolha._sum.salario_base || 0
      },
      error: null
    });
  } catch (error) {
    console.error('[RH-SALARIOS] Erro ao listar salários:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao listar salários'
    });
  }
}

export async function criarSalario(req, res) {
  try {
    const { id_usuario, salario_base, bonus = 0, desconto = 0, vale_refeicao = 0, vale_transporte = 0, data_inicio, observacoes } = req.body;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Validações
    if (!id_usuario || !salario_base || !data_inicio) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'id_usuario, salario_base e data_inicio são obrigatórios'
      });
    }

    // Verificar se usuário existe e pertence ao mesmo cliente
    const usuario = await prisma.tb_usuario.findFirst({
      where: { id_usuario, id_cliente }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Usuário não encontrado ou não pertence a este cliente'
      });
    }

    // Idempotência: verificar se salário já existe para este usuário
    const salarioExistente = await prisma.tb_rh_salario.findFirst({
      where: { id_cliente, id_usuario, data_fim: null }
    });

    if (salarioExistente) {
      return res.status(409).json({
        success: false,
        data: null,
        error: 'Salário ativo já existe para este usuário'
      });
    }

    const novoSalario = await prisma.tb_rh_salario.create({
      data: {
        id_cliente,
        id_usuario,
        salario_base: parseFloat(salario_base),
        bonus: parseFloat(bonus),
        desconto: parseFloat(desconto),
        vale_refeicao: parseFloat(vale_refeicao),
        vale_transporte: parseFloat(vale_transporte),
        data_inicio: new Date(data_inicio),
        observacoes
      },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true, email: true } }
      }
    });

    return res.status(201).json({
      success: true,
      data: novoSalario,
      error: null
    });
  } catch (error) {
    console.error('[RH-SALARIOS] Erro ao criar salário:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao criar salário'
    });
  }
}

export async function atualizarSalario(req, res) {
  try {
    const { id: id_salario } = req.params;
    const { salario_base, bonus, desconto, vale_refeicao, vale_transporte, observacoes } = req.body;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Verificar propriedade (multi-tenant)
    const salario = await prisma.tb_rh_salario.findFirst({
      where: { id_salario: parseInt(id_salario), id_cliente }
    });

    if (!salario) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Salário não encontrado'
      });
    }

    const atualizado = await prisma.tb_rh_salario.update({
      where: { id_salario: parseInt(id_salario) },
      data: {
        ...(salario_base && { salario_base: parseFloat(salario_base) }),
        ...(bonus !== undefined && { bonus: parseFloat(bonus) }),
        ...(desconto !== undefined && { desconto: parseFloat(desconto) }),
        ...(vale_refeicao !== undefined && { vale_refeicao: parseFloat(vale_refeicao) }),
        ...(vale_transporte !== undefined && { vale_transporte: parseFloat(vale_transporte) }),
        ...(observacoes !== undefined && { observacoes })
      },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true, email: true } }
      }
    });

    return res.status(200).json({
      success: true,
      data: atualizado,
      error: null
    });
  } catch (error) {
    console.error('[RH-SALARIOS] Erro ao atualizar salário:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao atualizar salário'
    });
  }
}

/**
 * === DADOS RESIDENCIAIS ===
 */

export async function listarResidenciais(req, res) {
  try {
    const { page = 1, limit = 10, busca = '' } = req.query;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      id_cliente,
      tb_usuario: busca ? {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { email: { contains: busca, mode: 'insensitive' } }
        ]
      } : undefined
    };

    const [residenciais, total] = await Promise.all([
      prisma.tb_rh_residencial.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          tb_usuario: { select: { id_usuario: true, nome: true, email: true } }
        }
      }),
      prisma.tb_rh_residencial.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: residenciais,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      },
      error: null
    });
  } catch (error) {
    console.error('[RH-RESIDENCIAL] Erro ao listar residenciais:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao listar dados residenciais'
    });
  }
}

export async function criarResidencial(req, res) {
  try {
    const { id_usuario, logradouro, numero, complemento, bairro, cidade, estado, cep, ponto_referencia, telefone, email_pessoal } = req.body;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Validações
    if (!id_usuario || !logradouro || !numero || !bairro || !cidade || !estado || !cep) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Campos obrigatórios faltando'
      });
    }

    // Verificar usuário
    const usuario = await prisma.tb_usuario.findFirst({
      where: { id_usuario, id_cliente }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Usuário não encontrado'
      });
    }

    // Idempotência
    const residencialExistente = await prisma.tb_rh_residencial.findFirst({
      where: { id_cliente, id_usuario }
    });

    if (residencialExistente) {
      return res.status(409).json({
        success: false,
        data: null,
        error: 'Endereço já cadastrado para este usuário'
      });
    }

    const novoResidencial = await prisma.tb_rh_residencial.create({
      data: {
        id_cliente,
        id_usuario,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        cep,
        ponto_referencia,
        telefone,
        email_pessoal
      },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true } }
      }
    });

    return res.status(201).json({
      success: true,
      data: novoResidencial,
      error: null
    });
  } catch (error) {
    console.error('[RH-RESIDENCIAL] Erro ao criar residencial:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao criar dados residenciais'
    });
  }
}

export async function atualizarResidencial(req, res) {
  try {
    const { id: id_residencial } = req.params;
    const { logradouro, numero, complemento, bairro, cidade, estado, cep, ponto_referencia, telefone, email_pessoal } = req.body;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Verificar propriedade
    const residencial = await prisma.tb_rh_residencial.findFirst({
      where: { id_residencial: parseInt(id_residencial), id_cliente }
    });

    if (!residencial) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Dados residenciais não encontrados'
      });
    }

    const atualizado = await prisma.tb_rh_residencial.update({
      where: { id_residencial: parseInt(id_residencial) },
      data: {
        ...(logradouro && { logradouro }),
        ...(numero && { numero }),
        ...(complemento !== undefined && { complemento }),
        ...(bairro && { bairro }),
        ...(cidade && { cidade }),
        ...(estado && { estado }),
        ...(cep && { cep }),
        ...(ponto_referencia !== undefined && { ponto_referencia }),
        ...(telefone !== undefined && { telefone }),
        ...(email_pessoal !== undefined && { email_pessoal })
      },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true } }
      }
    });

    return res.status(200).json({
      success: true,
      data: atualizado,
      error: null
    });
  } catch (error) {
    console.error('[RH-RESIDENCIAL] Erro ao atualizar:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao atualizar dados residenciais'
    });
  }
}

/**
 * === CONTAS BANCÁRIAS ===
 */

export async function listarContasBanco(req, res) {
  try {
    const { page = 1, limit = 10, busca = '', ativo = true } = req.query;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      id_cliente,
      ativo: ativo === 'false' ? false : true,
      tb_usuario: busca ? {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { email: { contains: busca, mode: 'insensitive' } }
        ]
      } : undefined
    };

    const [contas, total] = await Promise.all([
      prisma.tb_rh_conta_banco.findMany({
        where,
        skip,
        take: limitNumber,
        include: {
          tb_usuario: { select: { id_usuario: true, nome: true, email: true } }
        }
      }),
      prisma.tb_rh_conta_banco.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: contas,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      },
      error: null
    });
  } catch (error) {
    console.error('[RH-CONTA-BANCO] Erro ao listar contas:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao listar contas bancárias'
    });
  }
}

export async function criarContaBanco(req, res) {
  try {
    const { id_usuario, banco, tipo_conta, agencia, numero_conta, digito_conta, chave_pix, titular_conta, cpf_titular } = req.body;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Validações
    if (!id_usuario || !banco || !tipo_conta || !agencia || !numero_conta || !titular_conta || !cpf_titular) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'Campos obrigatórios faltando'
      });
    }

    // Verificar usuário
    const usuario = await prisma.tb_usuario.findFirst({
      where: { id_usuario, id_cliente }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Usuário não encontrado'
      });
    }

    const novaConta = await prisma.tb_rh_conta_banco.create({
      data: {
        id_cliente,
        id_usuario,
        banco,
        tipo_conta,
        agencia,
        numero_conta,
        digito_conta,
        chave_pix,
        titular_conta,
        cpf_titular,
        ativo: true
      },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true } }
      }
    });

    return res.status(201).json({
      success: true,
      data: novaConta,
      error: null
    });
  } catch (error) {
    console.error('[RH-CONTA-BANCO] Erro ao criar conta:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao criar conta bancária'
    });
  }
}

export async function atualizarContaBanco(req, res) {
  try {
    const { id: id_conta_banco } = req.params;
    const { banco, tipo_conta, agencia, numero_conta, digito_conta, chave_pix, titular_conta, cpf_titular, ativo } = req.body;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Verificar propriedade
    const conta = await prisma.tb_rh_conta_banco.findFirst({
      where: { id_conta_banco: parseInt(id_conta_banco), id_cliente }
    });

    if (!conta) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Conta bancária não encontrada'
      });
    }

    const atualizado = await prisma.tb_rh_conta_banco.update({
      where: { id_conta_banco: parseInt(id_conta_banco) },
      data: {
        ...(banco && { banco }),
        ...(tipo_conta && { tipo_conta }),
        ...(agencia && { agencia }),
        ...(numero_conta && { numero_conta }),
        ...(digito_conta !== undefined && { digito_conta }),
        ...(chave_pix !== undefined && { chave_pix }),
        ...(titular_conta && { titular_conta }),
        ...(cpf_titular && { cpf_titular }),
        ...(ativo !== undefined && { ativo: Boolean(ativo) })
      },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true } }
      }
    });

    return res.status(200).json({
      success: true,
      data: atualizado,
      error: null
    });
  } catch (error) {
    console.error('[RH-CONTA-BANCO] Erro ao atualizar:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao atualizar conta bancária'
    });
  }
}

/**
 * === FOLHA DE PONTO / DIÁRIA ===
 */

export async function listarPontoDiaria(req, res) {
  try {
    const { page = 1, limit = 10, busca = '', status = 'TODOS', data_inicio, data_fim } = req.query;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    const pageNumber = Math.max(1, parseInt(page, 10));
    const limitNumber = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNumber - 1) * limitNumber;

    const where = {
      id_cliente,
      status: status !== 'TODOS' ? status : undefined,
      data_ponto: {
        ...(data_inicio && { gte: new Date(data_inicio) }),
        ...(data_fim && { lte: new Date(data_fim) })
      },
      tb_usuario: busca ? {
        OR: [
          { nome: { contains: busca, mode: 'insensitive' } },
          { email: { contains: busca, mode: 'insensitive' } }
        ]
      } : undefined
    };

    const [pontos, total] = await Promise.all([
      prisma.tb_rh_ponto_diaria.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: { data_ponto: 'desc' },
        include: {
          tb_usuario: { select: { id_usuario: true, nome: true, email: true } },
          tb_obra: { select: { id_obra: true, nome: true } }
        }
      }),
      prisma.tb_rh_ponto_diaria.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: pontos,
      meta: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber)
      },
      error: null
    });
  } catch (error) {
    console.error('[RH-PONTO] Erro ao listar pontos:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao listar folha de ponto'
    });
  }
}

export async function registrarPonto(req, res) {
  try {
    const { id_usuario, id_obra, data_ponto, hora_entrada, hora_saida, horas_trabalhadas, horas_extras = 0, valor_diaria, observacoes } = req.body;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Validações
    if (!id_usuario || !data_ponto || !valor_diaria) {
      return res.status(400).json({
        success: false,
        data: null,
        error: 'id_usuario, data_ponto e valor_diaria são obrigatórios'
      });
    }

    // Verificar usuário
    const usuario = await prisma.tb_usuario.findFirst({
      where: { id_usuario, id_cliente }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Usuário não encontrado'
      });
    }

    // Idempotência: não permitir dois registros no mesmo dia para o mesmo usuário
    const pontoExistente = await prisma.tb_rh_ponto_diaria.findFirst({
      where: {
        id_cliente,
        id_usuario,
        data_ponto: new Date(data_ponto)
      }
    });

    if (pontoExistente) {
      return res.status(409).json({
        success: false,
        data: null,
        error: 'Já existe registro de ponto para este usuário nesta data'
      });
    }

    const novoPonto = await prisma.tb_rh_ponto_diaria.create({
      data: {
        id_cliente,
        id_usuario,
        id_obra: id_obra ? parseInt(id_obra) : null,
        data_ponto: new Date(data_ponto),
        hora_entrada: hora_entrada ? new Date(hora_entrada) : null,
        hora_saida: hora_saida ? new Date(hora_saida) : null,
        horas_trabalhadas: parseFloat(horas_trabalhadas || 0),
        horas_extras: parseFloat(horas_extras),
        valor_diaria: parseFloat(valor_diaria),
        status: 'PENDENTE',
        observacoes
      },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true } },
        tb_obra: { select: { id_obra: true, nome: true } }
      }
    });

    return res.status(201).json({
      success: true,
      data: novoPonto,
      error: null
    });
  } catch (error) {
    console.error('[RH-PONTO] Erro ao registrar ponto:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao registrar ponto'
    });
  }
}

export async function aprovarPonto(req, res) {
  try {
    const { id: id_ponto_diaria } = req.params;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Verificar propriedade
    const ponto = await prisma.tb_rh_ponto_diaria.findFirst({
      where: { id_ponto_diaria: parseInt(id_ponto_diaria), id_cliente }
    });

    if (!ponto) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Ponto não encontrado'
      });
    }

    const aprovado = await prisma.tb_rh_ponto_diaria.update({
      where: { id_ponto_diaria: parseInt(id_ponto_diaria) },
      data: { status: 'APROVADO' },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true } },
        tb_obra: { select: { id_obra: true, nome: true } }
      }
    });

    return res.status(200).json({
      success: true,
      data: aprovado,
      error: null
    });
  } catch (error) {
    console.error('[RH-PONTO] Erro ao aprovar ponto:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao aprovar ponto'
    });
  }
}

export async function rejeitarPonto(req, res) {
  try {
    const { id: id_ponto_diaria } = req.params;
    const { motivo } = req.body;
    const id_cliente = req.user?.id_cliente;

    if (!id_cliente) {
      return res.status(401).json({
        success: false,
        data: null,
        error: 'id_cliente não encontrado'
      });
    }

    // Verificar propriedade
    const ponto = await prisma.tb_rh_ponto_diaria.findFirst({
      where: { id_ponto_diaria: parseInt(id_ponto_diaria), id_cliente }
    });

    if (!ponto) {
      return res.status(404).json({
        success: false,
        data: null,
        error: 'Ponto não encontrado'
      });
    }

    const rejeitado = await prisma.tb_rh_ponto_diaria.update({
      where: { id_ponto_diaria: parseInt(id_ponto_diaria) },
      data: { 
        status: 'REJEITADO',
        observacoes: motivo || ponto.observacoes
      },
      include: {
        tb_usuario: { select: { id_usuario: true, nome: true } },
        tb_obra: { select: { id_obra: true, nome: true } }
      }
    });

    return res.status(200).json({
      success: true,
      data: rejeitado,
      error: null
    });
  } catch (error) {
    console.error('[RH-PONTO] Erro ao rejeitar ponto:', error);
    return res.status(500).json({
      success: false,
      data: null,
      error: 'Erro ao rejeitar ponto'
    });
  }
}

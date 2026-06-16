import prisma from '../config/prisma.js';
import jwt from 'jsonwebtoken';

/**
 * Controller para funcionalidades de alto nível da Plataforma (Dashboard Admin)
 */

// 1. Métricas Globais (MASTER)
export async function getGlobalMetrics(req, res) {
  try {
    const [totalObras, totalUsuarios, totalDocumentos, obrasPorStatus] = await Promise.all([
      prisma.tb_obra.count(),
      prisma.tb_usuario.count(),
      prisma.tb_documento.count(),
      prisma.tb_obra.groupBy({
        by: ['id_status'],
        _count: true,
      })
    ]);

    // Simulação de faturamento SaaS baseada em usuários ativos
    const faturamentoMensalMock = totalUsuarios * 99.90; 

    return res.status(200).json({
      totalObras,
      totalUsuarios,
      totalDocumentos,
      obrasPorStatus,
      faturamentoMensal: faturamentoMensalMock,
      projetosAtivos: totalObras // Por enquanto simplificado
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ erro: 'Erro ao calcular métricas globais' });
  }
}

// 2. Gestão de Clientes (MASTER / FIN)
export async function getAllClients(req, res) {
  try {
    const clients = await prisma.tb_cliente.findMany({
      include: {
        _count: {
          select: { tb_obra_cliente: true }
        }
      },
      orderBy: { nome_razao: 'asc' }
    });

    return res.status(200).json(clients);
  } catch (error) {
    console.error('[ADMIN] Error in getAllClients:', error.message);
    return res.status(500).json({ erro: 'Erro ao listar clientes', detalhe: error.message });
  }
}

// 3. Auditoria de Profissionais (RH)
export async function getProfessionalAudit(req, res) {
  try {
    const profissionais = await prisma.tb_usuario.findMany({
      where: {
        tipo_usuario: 'fisica',
        numero_registro_profissional: { not: null }
      },
      select: {
        id_usuario: true,
        nome: true,
        email: true,
        funcao: true,
        tipo_registro_profissional: true,
        numero_registro_profissional: true,
        status_profissional: true
      }
    });

    return res.status(200).json(profissionais);
  } catch (error) {
    console.error('[ADMIN] Error in getProfessionalAudit:', error.message);
    return res.status(500).json({ erro: 'Erro na auditoria de profissionais' });
  }
}

// 4. Rentabilidade das Obras (FIN)
export async function getMacroProfitability(req, res) {
  try {
    const obras = await prisma.tb_obra.findMany({
      select: {
        nome: true,
        valor_orcado: true,
        custo_atual: true
      },
      take: 10
    });

    // Mock de rentabilidade plataforma (Receita SaaS vs Custo Infra) - Ilustrativo
    const data = {
      obras,
      rentabilidadePlataforma: {
        receitaSubscricao: 45000,
        custoInfra: 12000,
        lucroLiquido: 33000
      }
    };

    return res.status(200).json(data);
  } catch (error) {
    console.error('[ADMIN] Error in getMacroProfitability:', error.message);
    return res.status(500).json({ erro: 'Erro ao obter dados de rentabilidade', detalhe: error.message });
  }
}

// 5. Saúde do Sistema (DEV)
export async function getSystemHealth(req, res) {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`; // Testa conexão real
    const dbLatency = Date.now() - start;

    return res.status(200).json({
      status: 'UP',
      database: 'Connected',
      latency: `${dbLatency}ms`,
      uptime: process.uptime(),
      version: '1.0.0-rbac-p2'
    });
  } catch (error) {
    return res.status(500).json({
      status: 'DOWN',
      database: 'Error',
      erro: error.message
    });
  }
}

// 6. Listagem de Usuários para Impersonação (MASTER)
export async function getAllUsers(req, res) {
  try {
    // Apenas ADMIN_MASTER pode ver a lista completa
    console.log('[ADMIN] getAllUsers - User Info:', req.user);
    if (!req.user || req.user.role !== 'ADMIN_MASTER') {
      return res.status(403).json({ erro: 'Acesso negado. Apenas Admin Master pode impersonar.' });
    }

    const users = await prisma.tb_usuario.findMany({
      select: {
        id_usuario: true,
        nome: true,
        username: true,
        role: true,
        funcao: true
      },
      orderBy: { nome: 'asc' }
    });

    console.log(`[ADMIN] getAllUsers - Found ${users.length} users.`);
    return res.status(200).json(users);
  } catch (error) {
    console.error('[ADMIN] Critical error listing users:', error.message, error.stack);
    return res.status(500).json({ erro: 'Erro ao buscar lista de usuários', detalhe: error.message });
  }
}

// 7. Diários Pendentes de Auditoria (Engenheiro / Master)
export async function getPendingDiaries(req, res) {
  try {
    const { role, id: userId } = req.user;
    
    let whereClause = { status_auditoria: 'PENDENTE' };

    // Se for Engenheiro (RESPONSAVEL), filtra apenas pelas obras dele
    if (role === 'RESPONSAVEL') {
      whereClause.tb_obra = {
        id_usuario_responsavel: parseInt(userId)
      };
    } else if (role === 'PROPRIETARIO') {
      // Proprietário vê tudo da empresa dele
      const id_cliente = req.user.id_cliente;
      if (!id_cliente) return res.status(403).json({ erro: 'Proprietário sem empresa vinculada' });
      whereClause.tb_obra = {
        tb_obra_cliente: {
          some: { id_cliente }
        }
      };
    } else if (role !== 'ADMIN_MASTER' && role !== 'ADMIN') {
       // Outros perfis (exceto Master/Admin) não acessam o inbox global
       return res.status(403).json({ erro: 'Acesso negado ao inbox de auditoria.' });
    }

    const pendentes = await prisma.tb_diario_obra.findMany({
      where: whereClause,
      include: {
        tb_usuario: { select: { nome: true, role: true, funcao: true } },
        tb_obra: { select: { nome: true, cidade: true } }
      },
      orderBy: { data_registro: 'desc' }
    });

    console.log(`[ADMIN] getPendingDiaries - Found ${pendentes.length} pendencies.`);
    return res.status(200).json(pendentes);
  } catch (error) {
    console.error('[ADMIN] Critical error seeking pendencies:', error.message, error.stack);
    return res.status(500).json({ erro: 'Erro ao buscar diários pendentes', detalhe: error.message });
  }
}

/**
 * Impersona outro usuário (Apenas ADMIN_MASTER)
 */
export async function impersonarUsuario(req, res) {
  try {
    const { id } = req.params;

    if (!req.user || req.user.role !== 'ADMIN_MASTER') {
      return res.status(403).json({ erro: 'Acesso negado. Apenas Admin Master pode impersonar.' });
    }

    const targetUser = await prisma.tb_usuario.findUnique({
      where: { id_usuario: Number(id) }
    });

    if (!targetUser) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const token = jwt.sign(
      {
        id: targetUser.id_usuario,
        username: targetUser.username,
        role: targetUser.role || 'USER',
        nome: targetUser.nome,
        funcao: targetUser.funcao,
        id_cliente: targetUser.id_cliente || null,
        isImpersonated: true,
        impersonatorId: req.user.id
      },
      (() => { const secret = process.env.JWT_SECRET; if (!secret) throw new Error('JWT_SECRET not set'); return secret; })(),
      { expiresIn: '2h' }
    );

    return res.status(200).json({
      mensagem: `Impersonando ${targetUser.nome} com sucesso!`,
      user: {
        id: targetUser.id_usuario,
        username: targetUser.username,
        role: targetUser.role || 'USER',
        nome: targetUser.nome,
        email: targetUser.email,
        id_cliente: targetUser.id_cliente || null,
        isImpersonated: true,
        impersonatorId: req.user.id
      },
      token
    });
  } catch (error) {
    console.error('[ADMIN] Erro ao impersonar usuário:', error);
    return res.status(500).json({ erro: 'Erro interno ao impersonar usuário', detalhe: error.message });
  }
}


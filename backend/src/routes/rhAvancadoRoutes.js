/**
 * rhAvancadoRoutes.js
 * 
 * Rotas do Módulo RH Avançado (Multi-Tenant)
 * PROTEGIDO: Apenas usuários com permissão 'gerenciar_salario', 'gerenciar_dados_residenciais', etc.
 * 
 * Padrão: /api/rh-avancado/{modulo}/{acao}
 */

import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermissao } from '../middlewares/authorizationMiddleware.js';
import {
  // Salários
  listarSalarios,
  criarSalario,
  atualizarSalario,
  // Dados Residenciais
  listarResidenciais,
  criarResidencial,
  atualizarResidencial,
  // Contas Bancárias
  listarContasBanco,
  criarContaBanco,
  atualizarContaBanco,
  // Folha de Ponto
  listarPontoDiaria,
  registrarPonto,
  aprovarPonto,
  rejeitarPonto
} from '../controllers/rhAvancadoController.js';

const router = express.Router();

/**
 * =================== SALÁRIOS ===================
 */

router.get('/salarios',
  authMiddleware,
  requirePermissao('gerenciar_salario'),
  listarSalarios
);

router.post('/salarios',
  authMiddleware,
  requirePermissao('gerenciar_salario'),
  criarSalario
);

router.put('/salarios/:id',
  authMiddleware,
  requirePermissao('gerenciar_salario'),
  atualizarSalario
);

/**
 * =================== DADOS RESIDENCIAIS ===================
 */

router.get('/residencial',
  authMiddleware,
  requirePermissao('gerenciar_dados_residenciais'),
  listarResidenciais
);

router.post('/residencial',
  authMiddleware,
  requirePermissao('gerenciar_dados_residenciais'),
  criarResidencial
);

router.put('/residencial/:id',
  authMiddleware,
  requirePermissao('gerenciar_dados_residenciais'),
  atualizarResidencial
);

/**
 * =================== CONTAS BANCÁRIAS ===================
 */

router.get('/contas-banco',
  authMiddleware,
  requirePermissao('gerenciar_conta_banco'),
  listarContasBanco
);

router.post('/contas-banco',
  authMiddleware,
  requirePermissao('gerenciar_conta_banco'),
  criarContaBanco
);

router.put('/contas-banco/:id',
  authMiddleware,
  requirePermissao('gerenciar_conta_banco'),
  atualizarContaBanco
);

/**
 * =================== FOLHA DE PONTO / DIÁRIA ===================
 */

router.get('/ponto-diaria',
  authMiddleware,
  requirePermissao('gerenciar_ponto_diaria'),
  listarPontoDiaria
);

router.post('/ponto-diaria',
  authMiddleware,
  requirePermissao('gerenciar_ponto_diaria'),
  registrarPonto
);

router.patch('/ponto-diaria/:id/aprovar',
  authMiddleware,
  requirePermissao('gerenciar_ponto_diaria'),
  aprovarPonto
);

router.patch('/ponto-diaria/:id/rejeitar',
  authMiddleware,
  requirePermissao('gerenciar_ponto_diaria'),
  rejeitarPonto
);

export default router;

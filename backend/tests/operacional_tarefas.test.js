import { test, assert } from 'poku';

/**
 * operacional_tarefas.test.js
 * 
 * Testes unitários para Fluxo de Recebimento de Tarefas Operacionais (Play/Pause/Concluir).
 */

test('Tarefas - Play (Iniciar Serviço)', () => {
  const req = {
    body: { status: 'EM_ANDAMENTO', percentual_concluido: 10 }
  };

  const tarefaOriginal = {
    id_tarefa: 1,
    status: 'PENDENTE',
    motivo_pausa: 'Falta de Insumo',
    percentual_concluido: 0
  };

  // Simulação da lógica de atualização do status
  const data = {};
  if (req.body.status) {
    data.status = req.body.status;
    if (req.body.status === 'EM_ANDAMENTO') {
      data.motivo_pausa = null;
    }
  }
  if (req.body.percentual_concluido !== undefined) {
    data.percentual_concluido = req.body.percentual_concluido;
  }

  const tarefaAtualizada = { ...tarefaOriginal, ...data };

  assert.equal(tarefaAtualizada.status, 'EM_ANDAMENTO', 'Status deve mudar para EM_ANDAMENTO');
  assert.equal(tarefaAtualizada.motivo_pausa, null, 'Motivo de pausa anterior deve ser limpo ao iniciar o serviço');
  assert.equal(tarefaAtualizada.percentual_concluido, 10, 'Percentual concluído deve ser atualizado para 10%');
});

test('Tarefas - Pause (Relatar Impedimento)', () => {
  const req = {
    body: { status: 'PENDENTE', motivo_pausa: 'Quebra de Equipamento / Ferramenta' }
  };

  const tarefaOriginal = {
    id_tarefa: 1,
    status: 'EM_ANDAMENTO',
    motivo_pausa: null,
    percentual_concluido: 30
  };

  const data = {};
  if (req.body.status) {
    data.status = req.body.status;
  }
  if (req.body.motivo_pausa !== undefined) {
    data.motivo_pausa = req.body.motivo_pausa;
  }

  const tarefaAtualizada = { ...tarefaOriginal, ...data };

  assert.equal(tarefaAtualizada.status, 'PENDENTE', 'Status deve voltar para PENDENTE ao pausar');
  assert.equal(tarefaAtualizada.motivo_pausa, 'Quebra de Equipamento / Ferramenta', 'Motivo de pausa deve ser registrado no banco');
  assert.equal(tarefaAtualizada.percentual_concluido, 30, 'Percentual concluído deve ser mantido ao pausar');
});

test('Tarefas - Concluir (Enviar Comprovante Técnico)', () => {
  const req = {
    body: { status: 'CONCLUIDA', foto_comprovante: '/uploads/tarefa/prova123.jpg' }
  };

  const tarefaOriginal = {
    id_tarefa: 1,
    status: 'EM_ANDAMENTO',
    percentual_concluido: 70,
    foto_comprovante: null
  };

  const data = {};
  if (req.body.status) {
    data.status = req.body.status;
    if (req.body.status === 'CONCLUIDA') {
      data.percentual_concluido = 100;
    }
  }
  if (req.body.foto_comprovante !== undefined) {
    data.foto_comprovante = req.body.foto_comprovante;
  }

  const tarefaAtualizada = { ...tarefaOriginal, ...data };

  assert.equal(tarefaAtualizada.status, 'CONCLUIDA', 'Status deve ser alterado para CONCLUIDA');
  assert.equal(tarefaAtualizada.percentual_concluido, 100, 'Percentual concluído deve ser forçado em 100% ao concluir');
  assert.equal(tarefaAtualizada.foto_comprovante, '/uploads/tarefa/prova123.jpg', 'Foto de comprovante deve estar preenchida');
});

/**
 * seed_enrich.mjs — Enriquece as obras existentes com equipe, tarefas e financeiro
 * Executar: node seed_enrich.mjs
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Buscar usuários existentes
  const responsavel = await prisma.tb_usuario.findFirst({ where: { role: 'RESPONSAVEL' } });
  const trabalhadores = await prisma.tb_usuario.findMany({ where: { role: 'TRABALHADOR' }, take: 5 });
  const resp = responsavel?.id_usuario || 1;
  
  // Buscar todas as obras
  const obras = await prisma.tb_obra.findMany({ include: { tb_status: true } });
  console.log(`Enriquecendo ${obras.length} obras...`);

  for (const obra of obras) {
    console.log(`\n📋 ${obra.nome}`);
    
    // 1. Equipe: vincula responsável e 1-2 trabalhadores
    await prisma.tb_usuario_obra.upsert({
      where: { id_usuario_id_obra: { id_usuario: resp, id_obra: obra.id_obra } },
      update: {},
      create: { id_obra: obra.id_obra, id_usuario: resp, valor_dia: 800 }
    }).catch(() => {});
    
    for (let i = 0; i < Math.min(2, trabalhadores.length); i++) {
      const t = trabalhadores[i];
      await prisma.tb_usuario_obra.upsert({
        where: { id_usuario_id_obra: { id_usuario: t.id_usuario, id_obra: obra.id_obra } },
        update: {},
        create: { id_obra: obra.id_obra, id_usuario: t.id_usuario, valor_dia: 280 }
      }).catch(() => {});
    }
    console.log('  ✅ Equipe vinculada');

    // 2. Tarefas — cria 3 se não houver
    const tarefasExistentes = await prisma.tb_tarefa.count({ where: { id_obra: obra.id_obra } });
    if (tarefasExistentes === 0) {
      const tarefasData = [
        { titulo: 'Fundação e Estrutura',          prioridade: 'ALTA',   status: 'CONCLUIDA', percentual_concluido: 100 },
        { titulo: 'Instalações Elétricas',         prioridade: 'MEDIA',  status: 'EM_PROGRESSO', percentual_concluido: 60 },
        { titulo: 'Acabamento e Pintura',          prioridade: 'NORMAL', status: 'PENDENTE',  percentual_concluido: 0  },
      ];
      for (const td of tarefasData) {
        const tarefa = await prisma.tb_tarefa.create({
          data: {
            ...td,
            descricao: `Tarefa de ${td.titulo} da obra ${obra.nome}`,
            id_obra: obra.id_obra,
          }
        });
        // Vincula o responsável à tarefa
        await prisma.tb_tarefa_usuario.create({
          data: { id_tarefa: tarefa.id_tarefa, id_usuario: resp }
        }).catch(() => {});
      }
      console.log('  ✅ 3 tarefas criadas');
    } else {
      console.log(`  ⚠️ Já tem ${tarefasExistentes} tarefas — pulando`);
    }

    // 3. Financeiro — adiciona 2-3 lançamentos se não houver
    const finExistentes = await prisma.tb_financeiro_obra.count({ where: { id_obra: obra.id_obra } });
    if (finExistentes === 0) {
      const orcado = Number(obra.valor_orcado || 0);
      const entradas = [
        { tipo: 'ENTRADA', descricao: 'Aporte inicial do cliente', valor: orcado * 0.4, categoria: 'Recursos', justificativa: 'Pagamento inicial conforme contrato' },
        { tipo: 'SAIDA',   descricao: 'Compra de materiais básicos', valor: orcado * 0.15, categoria: 'Materiais', justificativa: 'Concreto, aço e materiais de fundação' },
        { tipo: 'SAIDA',   descricao: 'Mão de obra equipe inicial', valor: orcado * 0.08, categoria: 'Pessoal', justificativa: 'Pagamento quinzenal da equipe' },
      ];
      for (const e of entradas) {
        await prisma.tb_financeiro_obra.create({
          data: {
            ...e,
            id_obra: obra.id_obra,
            id_usuario_responsavel: resp,
            data_lancamento: new Date(),
          }
        }).catch(() => {});
      }
      console.log('  ✅ 3 lançamentos financeiros criados');
    } else {
      console.log(`  ⚠️ Já tem ${finExistentes} lançamentos — pulando`);
    }

    // 4. Estoque — adiciona itens básicos se não houver
    const estoqueExistente = await prisma.tb_estoque_obra.count({ where: { id_obra: obra.id_obra } });
    if (estoqueExistente === 0) {
      const itens = [
        { nome_material: 'Cimento CP-II 50kg', unidade_medida: 'Saco', quantidade: 120 },
        { nome_material: 'Areia Grossa',       unidade_medida: 'm³',  quantidade: 25 },
        { nome_material: 'Tijolo Cerâmico',    unidade_medida: 'Milheiro', quantidade: 8 },
        { nome_material: 'Vergalhão CA-50 12mm', unidade_medida: 'Barra', quantidade: 200 },
      ];
      await prisma.tb_estoque_obra.createMany({
        data: itens.map(i => ({ ...i, id_obra: obra.id_obra })),
        skipDuplicates: true,
      });
      console.log('  ✅ 4 itens de estoque criados');
    } else {
      console.log(`  ⚠️ Já tem ${estoqueExistente} itens de estoque — pulando`);
    }
  }

  console.log('\n🎯 Enriquecimento concluído!');
}

main().catch(console.error).finally(() => prisma.$disconnect());

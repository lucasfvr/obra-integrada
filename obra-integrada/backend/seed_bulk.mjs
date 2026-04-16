/**
 * seed_bulk.mjs — Adiciona mais 7 obras de exemplo para totalizar 10
 * Executar: node seed_bulk.mjs
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Status IDs
  const statuses = await prisma.tb_status.findMany();
  const s = Object.fromEntries(statuses.map(st => [st.nome, st.id_status]));
  const statusEmAndamento = s['Em Andamento'] || 2;
  const statusPlanejamento = s['Planejamento'] || 1;
  const statusFinalizada = s['Finalizada'] || 4;

  // Responsável padrão
  const resp = await prisma.tb_usuario.findFirst({ where: { role: 'RESPONSAVEL' } });
  const respId = resp?.id_usuario || 1;

  // Cliente para vincular
  const cliente = await prisma.tb_cliente.findFirst();
  const clienteId = cliente?.id_cliente;

  const novasObras = [
    {
      nome: 'Condomínio Terraço Verde',
      tipo_obra: 'Residencial',
      logradouro: 'Rua Floresta, 200',
      numero: '200',
      bairro: 'Vila Verde',
      cidade: 'Curitiba',
      estado: 'PR',
      cep: '80010-100',
      data_inicio: new Date('2024-06-01'),
      previsao_termino: new Date('2025-11-30'),
      valor_orcado: 2800000.00,
      custo_atual: 950000.00,
      id_status: statusEmAndamento,
      id_usuario_responsavel: respId,
      observacoes: 'Condomínio fechado com 120 unidades e área de lazer completa.',
    },
    {
      nome: 'Hospital Regional Santa Cruz',
      tipo_obra: 'Institucional',
      logradouro: 'Av. Saúde, 5000',
      numero: '5000',
      bairro: 'Centro',
      cidade: 'Porto Alegre',
      estado: 'RS',
      cep: '90020-000',
      data_inicio: new Date('2024-01-10'),
      previsao_termino: new Date('2026-12-31'),
      valor_orcado: 12000000.00,
      custo_atual: 3400000.00,
      id_status: statusEmAndamento,
      id_usuario_responsavel: respId,
      observacoes: 'Ampliação do hospital com novo bloco cirúrgico e UTI.',
    },
    {
      nome: 'Loteamento Bella Vista',
      tipo_obra: 'Loteamento',
      logradouro: 'Estrada Municipal, km 5',
      numero: 'km 5',
      bairro: 'Zona Rural',
      cidade: 'Ribeirão Preto',
      estado: 'SP',
      cep: '14000-000',
      data_inicio: new Date('2025-02-01'),
      previsao_termino: new Date('2026-03-31'),
      valor_orcado: 5500000.00,
      custo_atual: 200000.00,
      id_status: statusPlanejamento,
      id_usuario_responsavel: respId,
      observacoes: '350 lotes com infraestrutura completa.',
    },
    {
      nome: 'Reforma Sede Administrativa',
      tipo_obra: 'Reforma',
      logradouro: 'Av. Brigadeiro Faria Lima, 3900',
      numero: '3900',
      bairro: 'Itaim Bibi',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '04538-132',
      data_inicio: new Date('2024-08-01'),
      previsao_termino: new Date('2024-12-15'),
      valor_orcado: 650000.00,
      custo_atual: 640000.00,
      id_status: statusFinalizada,
      id_usuario_responsavel: respId,
      observacoes: 'Retrofit completo do escritório sede.',
    },
    {
      nome: 'Escola Municipal Nova Geração',
      tipo_obra: 'Institucional',
      logradouro: 'Rua da Educação, 300',
      numero: '300',
      bairro: 'Centro',
      cidade: 'Fortaleza',
      estado: 'CE',
      cep: '60100-060',
      data_inicio: new Date('2024-04-01'),
      previsao_termino: new Date('2025-04-30'),
      valor_orcado: 3200000.00,
      custo_atual: 1800000.00,
      id_status: statusEmAndamento,
      id_usuario_responsavel: respId,
      observacoes: 'Escola com 30 salas e quadra poliesportiva coberta.',
    },
    {
      nome: 'Data Center Serverbras',
      tipo_obra: 'Comercial',
      logradouro: 'Rodovia dos Bandeirantes, km 10',
      numero: 'km 10',
      bairro: 'Polo Tech',
      cidade: 'Campinas',
      estado: 'SP',
      cep: '13212-000',
      data_inicio: new Date('2025-03-01'),
      previsao_termino: new Date('2026-09-30'),
      valor_orcado: 18000000.00,
      custo_atual: 500000.00,
      id_status: statusPlanejamento,
      id_usuario_responsavel: respId,
      observacoes: 'Infraestrutura tier 3 com gerador de emergência e redundância dupla.',
    },
    {
      nome: 'Ponto Comercial Bom Preço',
      tipo_obra: 'Comercial',
      logradouro: 'Av. Brasil, 1100',
      numero: '1100',
      bairro: 'Bairro dos Comércios',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      cep: '30140-001',
      data_inicio: new Date('2023-07-15'),
      previsao_termino: new Date('2024-02-28'),
      valor_orcado: 450000.00,
      custo_atual: 452000.00,
      id_status: statusFinalizada,
      id_usuario_responsavel: respId,
      observacoes: 'Loja de varejo de 1.200m² com estacionamento.',
    },
  ];

  let criadas = 0;
  for (const o of novasObras) {
    const existe = await prisma.tb_obra.findFirst({ where: { nome: o.nome } });
    if (existe) {
      console.log(`⚠️ Já existe: ${o.nome}`);
      continue;
    }
    const obra = await prisma.tb_obra.create({ data: o });
    console.log(`✅ Criada: ${obra.nome} (id: ${obra.id_obra})`);
    criadas++;

    // Vincular ao cliente (multi-tenant)
    if (clienteId) {
      await prisma.tb_obra_cliente.upsert({
        where: { id_obra_id_cliente: { id_obra: obra.id_obra, id_cliente: clienteId } },
        update: {},
        create: { id_obra: obra.id_obra, id_cliente: clienteId },
      }).catch(() => {});
    }
    // Também vincula ao cliente 2 (admin_master)
    await prisma.tb_obra_cliente.upsert({
      where: { id_obra_id_cliente: { id_obra: obra.id_obra, id_cliente: 2 } },
      update: {},
      create: { id_obra: obra.id_obra, id_cliente: 2 },
    }).catch(() => {});
  }

  const total = await prisma.tb_obra.count();
  console.log(`\n🎯 Total de obras no banco: ${total}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

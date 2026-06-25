import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const paginas = [
    { nome: 'RH Protegido', rota: '/test-1' },
    { nome: 'Relatórios VIP', rota: '/test-2' },
    { nome: 'Suporte VIP', rota: '/test-3' },
    { nome: 'Planejamento', rota: '/planejamento' },
    { nome: 'Engenharia', rota: '/engenheiro' },
  ];

  for (const pag of paginas) {
    await prisma.tb_pagina.upsert({
      where: { rota: pag.rota },
      update: { nome: pag.nome },
      create: pag
    });
  }

  console.log('Páginas criadas/atualizadas com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

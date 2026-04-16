import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const count = await prisma.tb_obra.count();
  console.log('Obra count:', count);
  const obras = await prisma.tb_obra.findMany({ take: 5 });
  console.log('Obras:', JSON.stringify(obras, null, 2));
}
run().finally(() => prisma.$disconnect());

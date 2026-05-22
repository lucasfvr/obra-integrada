import prisma from './src/config/prisma.js';

async function main() {
  const user = await prisma.tb_usuario.findUnique({
    where: { email: 'bb@test.com' }
  });
  console.log(JSON.stringify(user, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());

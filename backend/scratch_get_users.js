import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.tb_usuario.findMany({
    select: {
      id_usuario: true,
      nome: true,
      email: true,
      username: true,
      role: true,
      acesso_rh: true
    }
  });
  console.log("USERS_LIST_START");
  console.log(JSON.stringify(users, null, 2));
  console.log("USERS_LIST_END");
}

main().catch(console.error).finally(() => prisma.$disconnect());

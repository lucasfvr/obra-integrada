import prisma from './src/config/prisma.js';

const email = 'claudiarritson@gmail.com';
const normalized = email.trim().toLowerCase();

async function run() {
  const u1 = await prisma.tb_usuario.findFirst({ where: { email: normalized } });
  const u2 = await prisma.tb_usuario.findFirst({ where: { username: normalized } });
  const raw = await prisma.$queryRawUnsafe(`SELECT id_usuario, email, username FROM tb_usuario WHERE lower(email) = lower(${JSON.stringify(email)}) OR lower(username) = lower(${JSON.stringify(email)})`);
  console.log(JSON.stringify({ findEmail: u1 ? { id: u1.id_usuario, email: u1.email, username: u1.username } : null, findUsername: u2 ? { id: u2.id_usuario, email: u2.email, username: u2.username } : null, raw }, null, 2));
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  prisma.$disconnect().catch(() => {});
  process.exit(1);
});
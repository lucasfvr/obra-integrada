// seed.js — Cria o usuário Admin Master no banco de dados
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@obras.com';
  const senha = 'Admin123!';

  // Verifica se já existe
  const existing = await prisma.tb_usuario.findFirst({
    where: { email }
  });

  if (existing) {
    // Garante que o role seja ADMIN mesmo que já exista
    await prisma.tb_usuario.update({
      where: { id_usuario: existing.id_usuario },
      data: { role: 'ADMIN' }
    });
    console.log('✅ Admin já existe — role atualizado para ADMIN.');
    return;
  }

  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.tb_usuario.create({
    data: {
      nome: 'Administrador Master',
      username: 'admin',
      email,
      senha: senhaHash,
      role: 'ADMIN',
      tipo_usuario: 'ADMIN',
    }
  });

  console.log('✅ Admin Master criado com sucesso!');
  console.log('   Email:', email);
  console.log('   Senha:', senha);
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

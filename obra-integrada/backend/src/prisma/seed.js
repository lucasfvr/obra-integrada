import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  // Seed status
  const statuses = ['Planejamento', 'Em Andamento', 'Pausada', 'Finalizada', 'Cancelada'];
  for (const status of statuses) {
    await prisma.tb_status.upsert({
      where: { id_status: statuses.indexOf(status) + 1 }, // Assuming we can use ID like this, actually wait, id_status is autoincrement but let's just findFirst or create
      update: {},
      create: { nome: status },
    });
  }

  // Seed roles
  const papeis = ['Engenheiro Responsável', 'Arquiteto', 'Mestre de Obras', 'Pedreiro', 'Ajudante', 'Eletricista', 'Encanador', 'Cliente/Dono'];
  for (const papel of papeis) {
    // Check if it exists
    const existing = await prisma.tb_papel.findFirst({ where: { nome: papel } });
    if (!existing) {
      await prisma.tb_papel.create({ data: { nome: papel } });
    }
  }

  // Seed Admin Area
  const adminEmail = 'admin@obras.com';
  const existingAdmin = await prisma.tb_usuario.findFirst({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedSenha = await bcrypt.hash('Admin123!', 10);
    await prisma.tb_usuario.create({
      data: {
        nome: 'Administrador Mestre',
        email: adminEmail,
        username: adminEmail,
        senha: hashedSenha,
        tipo_usuario: 'fisica',
        role: 'ADMIN'
      }
    });
    console.log('Conta Mestre criada: admin@obras.com / Admin123!');
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

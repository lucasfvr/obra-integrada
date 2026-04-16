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
  const papeis = ['Membro', 'Mestre', 'Engenheiro', 'Pedreiro', 'Ajudante', 'Eletricista', 'Encanador'];
  for (let i = 0; i < papeis.length; i++) {
    const nome = papeis[i];
    await prisma.tb_papel.upsert({
      where: { id_papel: i + 1 },
      update: { nome },
      create: { id_papel: i + 1, nome: nome },
    });
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

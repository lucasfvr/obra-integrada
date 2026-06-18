// seed.js — Cria o usuário Admin Master no banco de dados
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const usuarios = [
    {
      nome: 'Administrador Master',
      username: 'admin',
      email: 'admin@obras.com',
      senha: 'Admin123!',
      role: 'ADMIN',
      tipo_usuario: 'ADMIN',
    },
    {
      nome: 'Gerente de RH',
      username: 'rh_manager',
      email: 'rh@obras.com',
      senha: 'RH123456!',
      role: 'RH',
      tipo_usuario: 'RH',
    },
    {
      nome: 'RH Manager - Gestor',
      username: 'rh_gestor',
      email: 'rh.gestor@obras.com',
      senha: 'RH123456!',
      role: 'PROPRIETARIO',
      tipo_usuario: 'PROPRIETARIO',
    },
    {
      nome: 'RH Viewer - Engenheiro',
      username: 'rh_viewer',
      email: 'rh.viewer@obras.com',
      senha: 'RH123456!',
      role: 'RESPONSAVEL',
      tipo_usuario: 'RESPONSAVEL',
    },
    {
      nome: 'Usuário Sem Acesso RH',
      username: 'sem_rh',
      email: 'sem.rh@obras.com',
      senha: 'Test123456!',
      role: 'TRABALHADOR',
      tipo_usuario: 'TRABALHADOR',
    },
  ];

  console.log('\n🌱 Iniciando seed de usuários de teste...\n');

  for (const usuario of usuarios) {
    // Verifica se já existe por email ou username
    const existing = await prisma.tb_usuario.findFirst({
      where: {
        OR: [
          { email: usuario.email },
          { username: usuario.username }
        ]
      }
    });

    if (existing) {
      await prisma.tb_usuario.update({
        where: { id_usuario: existing.id_usuario },
        data: { 
          role: usuario.role,
          email: usuario.email,
          username: usuario.username
        }
      });
      console.log(`✅ ${usuario.nome} já existe — dados atualizados`);
      continue;
    }

    const senhaHash = await bcrypt.hash(usuario.senha, 10);

    await prisma.tb_usuario.create({
      data: {
        nome: usuario.nome,
        username: usuario.username,
        email: usuario.email,
        senha: senhaHash,
        role: usuario.role,
        tipo_usuario: usuario.tipo_usuario,
      }
    });

    console.log(`✅ ${usuario.nome} criado`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Senha: ${usuario.senha}`);
    console.log(`   Role: ${usuario.role}`);
    console.log(`   Acesso RH: ${usuario.role === 'TRABALHADOR' ? '❌ Não' : '✅ Sim'}\n`);
  }

  console.log('✨ Seed concluído!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

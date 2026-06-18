import prisma from './config/prisma.js';

async function main() {
  console.log('Tentando conectar ao banco de dados...');
  try {
    const userCount = await prisma.tb_usuario.count();
    console.log('Conexão bem sucedida!');
    console.log(`Total de usuários cadastrados no banco: ${userCount}`);
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:');
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();

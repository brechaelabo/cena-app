
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔧 Criando usuário admin...');
    
    // Deletar usuário se existir
    await prisma.user.delete({
      where: { email: 'contato@labo.art.br' }
    }).catch(() => console.log('📝 Usuário não existia anteriormente'));

    // Criar novo usuário
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'contato@labo.art.br',
        password: hashedPassword,
        name: 'Administrador',
        currentRole: 'ADMIN',
        isApproved: true
      }
    });

    // Criar role pivot
    await prisma.rolePivot.create({
      data: {
        userId: user.id,
        role: 'ADMIN'
      }
    });

    console.log('✅ Admin criado com sucesso!');
    console.log('📧 Email: contato@labo.art.br');
    console.log('🔑 Senha: admin123');
    console.log('👑 Role: ADMIN');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();

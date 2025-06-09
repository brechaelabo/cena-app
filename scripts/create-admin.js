
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
require('dotenv').config();

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'contato@labo.art.br';
    const password = 'admin123'; // Senha temporária - deve ser alterada no primeiro login
    const name = 'Administrador LABO';

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('❌ Usuário já existe:', email);
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
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

    console.log('✅ Administrador criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha temporária:', password);
    console.log('⚠️  IMPORTANTE: Altere a senha no primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();


const { PrismaClient } = require('@prisma/client');

async function createAdminWithFallback() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Iniciando criação do admin...');
    
    // Primeiro, verificar se bcrypt está disponível
    let bcrypt;
    try {
      bcrypt = require('bcrypt');
    } catch (err) {
      console.log('⚠️  bcrypt não encontrado, usando senha em texto plano temporariamente');
    }
    
    const email = 'contato@labo.art.br';
    const plainPassword = 'admin123';
    
    // Deletar usuário existente se houver
    try {
      await prisma.user.delete({ where: { email } });
      console.log('🗑️  Usuário existente removido');
    } catch (e) {
      console.log('📝 Nenhum usuário anterior encontrado');
    }
    
    // Hash da senha se bcrypt estiver disponível
    const password = bcrypt ? await bcrypt.hash(plainPassword, 10) : plainPassword;
    
    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name: 'Admin LABO',
        currentRole: 'ADMIN',
        isApproved: true
      }
    });
    
    console.log('✅ Usuário criado:', user.id);
    
    // Criar role pivot
    try {
      await prisma.rolePivot.create({
        data: {
          userId: user.id,
          role: 'ADMIN'
        }
      });
      console.log('✅ Role pivot criada');
    } catch (e) {
      console.log('⚠️  Role pivot já existe ou erro:', e.message);
    }
    
    console.log('🎉 ADMIN CRIADO COM SUCESSO!');
    console.log('📧 Email: contato@labo.art.br');
    console.log('🔑 Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro completo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminWithFallback();


const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAndCreateAdmin() {
  try {
    console.log('🔄 Resetting database...');
    
    // Delete all data
    await prisma.submission.deleteMany({});
    await prisma.theme.deleteMany({});
    await prisma.rolePivot.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('🗑️ All data deleted');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'contato@labo.art.br',
        name: 'Admin CENA',
        hashedPassword,
        isApproved: true,
        roles: {
          create: {
            role: 'ADMIN'
          }
        }
      },
      include: {
        roles: true
      }
    });

    console.log('✅ Admin created successfully:', {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      isApproved: admin.isApproved
    });

    console.log('🎯 Database reset complete. Use these credentials:');
    console.log('📧 Email: contato@labo.art.br');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAndCreateAdmin();

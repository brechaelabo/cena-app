
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '../../types';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/users - Lista todos os usuários (apenas admin)
router.get('/', authenticateToken, requireRole([Role.ADMIN]), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        currentRole: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/users/:id - Obter usuário específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;

    // Usuários só podem ver seus próprios dados, exceto admins
    if (requestingUser.currentRole !== Role.ADMIN && requestingUser.id !== id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        currentRole: true,
        isApproved: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/users/:id - Atualizar usuário
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const requestingUser = req.user;
    const { name, email, currentRole, isApproved } = req.body;

    // Validações básicas
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nome e email são obrigatórios'
      });
    }

    // Verificar permissões
    const isOwnProfile = requestingUser.id === id;
    const isAdmin = requestingUser.currentRole === Role.ADMIN;

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Usuários comuns só podem alterar nome e email
    const updateData: any = { name, email };

    // Apenas admins podem alterar role e status de aprovação
    if (isAdmin) {
      if (currentRole) updateData.currentRole = currentRole;
      if (isApproved !== undefined) updateData.isApproved = isApproved;
    }

    // Verificar se email já existe (exceto para o próprio usuário)
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id }
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Este email já está em uso'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        currentRole: true,
        isApproved: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/users/:id - Deletar usuário (apenas admin)
router.delete('/:id', authenticateToken, requireRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    // Não permitir que admin delete a si mesmo
    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PATCH /api/users/:id/toggle-approval - Toggle aprovação do usuário (apenas admin)
router.patch('/:id/toggle-approval', authenticateToken, requireRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isApproved: !user.isApproved
      },
      select: {
        id: true,
        email: true,
        name: true,
        currentRole: true,
        isApproved: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: updatedUser,
      message: `Usuário ${updatedUser.isApproved ? 'aprovado' : 'desaprovado'} com sucesso`
    });
  } catch (error) {
    console.error('Error toggling user approval:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

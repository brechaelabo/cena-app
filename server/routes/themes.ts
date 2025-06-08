
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/themes - Lista todos os temas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: themes
    });
  } catch (error) {
    console.error('Error fetching themes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/themes/:id - Obter tema específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const theme = await prisma.theme.findUnique({
      where: { id }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Tema não encontrado'
      });
    }

    res.json({
      success: true,
      data: theme
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/themes - Criar novo tema (apenas admin)
router.post('/', authenticateToken, requireRole([Role.ADMIN]), async (req, res) => {
  try {
    const { title, description, active, videoUrls, pdfUrls } = req.body;

    // Validações básicas
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Título e descrição são obrigatórios'
      });
    }

    const theme = await prisma.theme.create({
      data: {
        title,
        description,
        active: active || false,
        videoUrls: videoUrls || [],
        pdfUrls: pdfUrls || []
      }
    });

    res.status(201).json({
      success: true,
      data: theme,
      message: 'Tema criado com sucesso'
    });
  } catch (error) {
    console.error('Error creating theme:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/themes/:id - Atualizar tema (apenas admin)
router.put('/:id', authenticateToken, requireRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, active, videoUrls, pdfUrls } = req.body;

    // Validações básicas
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Título e descrição são obrigatórios'
      });
    }

    const theme = await prisma.theme.findUnique({
      where: { id }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Tema não encontrado'
      });
    }

    const updatedTheme = await prisma.theme.update({
      where: { id },
      data: {
        title,
        description,
        active,
        videoUrls: videoUrls || [],
        pdfUrls: pdfUrls || []
      }
    });

    res.json({
      success: true,
      data: updatedTheme,
      message: 'Tema atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/themes/:id - Deletar tema (apenas admin)
router.delete('/:id', authenticateToken, requireRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const theme = await prisma.theme.findUnique({
      where: { id }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Tema não encontrado'
      });
    }

    // Verificar se existem submissions vinculadas a este tema
    const submissionsCount = await prisma.submission.count({
      where: { themeId: id }
    });

    if (submissionsCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar este tema pois existem submissions vinculadas a ele'
      });
    }

    await prisma.theme.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Tema deletado com sucesso'
    });
  } catch (error) {
    console.error('Error deleting theme:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PATCH /api/themes/:id/toggle-active - Toggle status ativo do tema (apenas admin)
router.patch('/:id/toggle-active', authenticateToken, requireRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;

    const theme = await prisma.theme.findUnique({
      where: { id }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Tema não encontrado'
      });
    }

    const updatedTheme = await prisma.theme.update({
      where: { id },
      data: {
        active: !theme.active
      }
    });

    res.json({
      success: true,
      data: updatedTheme,
      message: `Tema ${updatedTheme.active ? 'ativado' : 'desativado'} com sucesso`
    });
  } catch (error) {
    console.error('Error toggling theme status:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

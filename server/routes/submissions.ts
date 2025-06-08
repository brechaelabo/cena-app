
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';
import { Role } from '../../types';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/submissions - Lista submissions (filtrado por role)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const { themeId, status, tutorId } = req.query;

    let whereClause: any = {};

    // Filtros baseados no role do usuário
    if (user.currentRole === Role.ACTOR) {
      // Atores só veem suas próprias submissions
      whereClause.actorId = user.id;
    } else if (user.currentRole === Role.TUTOR) {
      // Tutores veem submissions atribuídas a eles
      whereClause.tutorId = user.id;
    }
    // Admins veem todas as submissions (sem filtro adicional)

    // Aplicar filtros de query params
    if (themeId) whereClause.themeId = themeId;
    if (status) whereClause.status = status;
    if (tutorId && user.currentRole === Role.ADMIN) {
      whereClause.tutorId = tutorId;
    }

    const submissions = await prisma.submission.findMany({
      where: whereClause,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        theme: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: submissions
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/submissions/:id - Obter submission específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        theme: true
      }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission não encontrada'
      });
    }

    // Verificar permissões de acesso
    const hasAccess = 
      user.currentRole === Role.ADMIN ||
      submission.actorId === user.id ||
      submission.tutorId === user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/submissions - Criar nova submission (atores)
router.post('/', authenticateToken, requireRole([Role.ACTOR]), async (req, res) => {
  try {
    const { themeId, videoUrl, description } = req.body;

    // Validações básicas
    if (!themeId || !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Tema e vídeo são obrigatórios'
      });
    }

    // Verificar se o tema existe e está ativo
    const theme = await prisma.theme.findUnique({
      where: { id: themeId }
    });

    if (!theme) {
      return res.status(404).json({
        success: false,
        message: 'Tema não encontrado'
      });
    }

    if (!theme.active) {
      return res.status(400).json({
        success: false,
        message: 'Este tema não está ativo para submissions'
      });
    }

    const submission = await prisma.submission.create({
      data: {
        actorId: req.user.id,
        themeId,
        videoUrl,
        description: description || '',
        status: 'PENDING'
      },
      include: {
        theme: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: submission,
      message: 'Submission criada com sucesso'
    });
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/submissions/:id/assign-tutor - Atribuir tutor à submission (admin)
router.put('/:id/assign-tutor', authenticateToken, requireRole([Role.ADMIN]), async (req, res) => {
  try {
    const { id } = req.params;
    const { tutorId } = req.body;

    if (!tutorId) {
      return res.status(400).json({
        success: false,
        message: 'ID do tutor é obrigatório'
      });
    }

    // Verificar se a submission existe
    const submission = await prisma.submission.findUnique({
      where: { id }
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission não encontrada'
      });
    }

    // Verificar se o tutor existe e está aprovado
    const tutor = await prisma.user.findUnique({
      where: { id: tutorId }
    });

    if (!tutor || tutor.currentRole !== Role.TUTOR || !tutor.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Tutor inválido ou não aprovado'
      });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        tutorId,
        status: 'ASSIGNED'
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tutor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        theme: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: updatedSubmission,
      message: 'Tutor atribuído com sucesso'
    });
  } catch (error) {
    console.error('Error assigning tutor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;

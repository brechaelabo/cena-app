import app, { prisma, logger } from './app';

const PORT = process.env.PORT || 3001;

async function startDevServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Start server
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Backend server running on http://0.0.0.0:${PORT}`);
      logger.info(`📡 API available at http://0.0.0.0:${PORT}/api`);
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Health check
    setTimeout(async () => {
      try {
        const response = await fetch(`http://localhost:${PORT}/api/health`);
        if (response.ok) {
          logger.info('✅ Backend health check passed');
        }
      } catch (error) {
        logger.warn('⚠️ Backend health check failed');
      }
    }, 2000);

  } catch (error) {
    logger.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully');
  await prisma.$disconnect();
  process.exit(0);
});

startDevServer();
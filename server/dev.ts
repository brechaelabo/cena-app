
import app, { prisma, logger } from './app';

const PORT = process.env.PORT || 3001;

async function startDevServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');
    
    // Start server
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`Development server running on http://0.0.0.0:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info('API endpoints available at:');
      logger.info(`  - Health: http://0.0.0.0:${PORT}/api/health`);
      logger.info(`  - Auth: http://0.0.0.0:${PORT}/api/auth/*`);
    });
  } catch (error) {
    logger.error('Failed to start development server:', error);
    process.exit(1);
  }
}

startDevServer();

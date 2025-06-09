
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors({
  origin: ['http://localhost:5001', 'http://127.0.0.1:5001', 'http://localhost:5000', 'http://127.0.0.1:5000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString()
  });
});

// Simple auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: email,
          name: 'Test User',
          currentRole: 'ACTOR',
          isApproved: true
        },
        token: 'mock-jwt-token'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Email e senha são obrigatórios'
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { email, password, name, role = 'ACTOR' } = req.body;
  
  if (email && password && name) {
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: '1',
          email: email,
          name: name,
          currentRole: role,
          isApproved: false
        },
        token: 'mock-jwt-token'
      }
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'Todos os campos são obrigatórios'
    });
  }
});

app.get('/api/auth/me', (req, res) => {
  res.json({
    success: true,
    data: {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      currentRole: 'ACTOR',
      isApproved: true,
      roles: ['ACTOR']
    }
  });
});

// Simple users endpoint
app.get('/api/users', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        currentRole: 'ACTOR',
        isApproved: true
      }
    ]
  });
});

// Simple themes endpoint
app.get('/api/themes', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: '1',
        title: 'Tema de Teste',
        description: 'Descrição do tema de teste',
        active: true
      }
    ]
  });
});

// Simple submissions endpoint
app.get('/api/submissions', (req, res) => {
  res.json({
    success: true,
    data: []
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on http://0.0.0.0:${PORT}`);
  console.log(`📡 API available at http://0.0.0.0:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Server started successfully at ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

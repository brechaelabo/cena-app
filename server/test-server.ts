
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on http://0.0.0.0:${PORT}`);
});

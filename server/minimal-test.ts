
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(cors());
app.use(express.json());

// Simple test route without any parameters
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Minimal server is running' });
});

// Test route with simple parameter
app.get('/api/test/:id', (req, res) => {
  res.json({ id: req.params.id, message: 'Parameter route working' });
});

console.log('Starting minimal server...');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal server running on http://0.0.0.0:${PORT}`);
});

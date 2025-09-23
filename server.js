import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001; // Changed from 5000 to 3001 to avoid AirTunes conflict

// Middleware
app.use(cors());
app.use(express.json());

// Simple API endpoints for BroncoFit
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from BroncoFit API!',
    service: 'AI Fitness Coaching',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/fitness-tip', (req, res) => {
  const tips = [
    'Stay hydrated during workouts!',
    'Remember to warm up before exercising.',
    'Consistency is key to fitness success.',
    'Listen to your body and rest when needed.',
    'Proper nutrition fuels your workouts.',
    'Set realistic goals and celebrate small wins.',
    'Mix cardio and strength training for best results.',
    'Get adequate sleep for muscle recovery.'
  ];

  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  res.json({
    tip: randomTip,
    category: 'fitness',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    service: 'BroncoFit API',
    version: '1.0.0',
    status: 'healthy',
    features: ['AI Coaching', 'Progress Tracking', 'Custom Workouts'],
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// AI Coach placeholder endpoint (future MongoDB/Ollama integration)
app.post('/api/coach', (req, res) => {
  const { goal } = req.body;

  if (!goal) {
    return res.status(400).json({ error: 'Goal is required' });
  }

  // Placeholder response - will integrate with Ollama AI later
  res.json({
    message: `Thanks for sharing your goal: "${goal}"`,
    response: 'Your AI coach will analyze this goal and create a personalized plan soon!',
    nextSteps: ['Connect to MongoDB for data storage', 'Integrate Ollama AI service'],
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'BroncoFit API' });
});

app.listen(PORT, () => {
  console.log(`🏋️‍♂️ BroncoFit API server running on http://localhost:${PORT}`);
  console.log(`📱 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/api/hello`);
  console.log(`   GET  http://localhost:${PORT}/api/fitness-tip`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log(`   POST http://localhost:${PORT}/api/coach`);
});

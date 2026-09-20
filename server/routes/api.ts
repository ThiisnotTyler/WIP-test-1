import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'NexusStream Express backend is actively running.',
    timestamp: new Date().toISOString()
  });
});

export default router;

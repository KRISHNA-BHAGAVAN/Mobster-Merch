import express from 'express';
import fs from 'fs';
import path from 'path';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();
const settingsFile = path.join(process.cwd(), 'settings.json');

// Get website status
router.get('/status', async (req, res) => {
  try {
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
      res.json({ isOpen: settings.isOpen || true });
    } else {
      res.json({ isOpen: true });
    }
  } catch (error) {
    res.json({ isOpen: true });
  }
});

// Toggle website status (admin only)
router.post('/toggle', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { isOpen } = req.body;
    const settings = { isOpen };
    
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
    
    res.json({ 
      message: `Website ${isOpen ? 'opened' : 'closed'} successfully`,
      isOpen 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating website status' });
  }
});

export default router;
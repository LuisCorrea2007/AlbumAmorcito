import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import mediaRoutes from './media.routes';
import noteRoutes from './note.routes';
import capsuleRoutes from './capsule.routes';
import timelineRoutes from './timeline.routes';
import moodRoutes from './mood.routes';
import dateRoutes from './date.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/media', mediaRoutes);
router.use('/notes', noteRoutes);
router.use('/capsules', capsuleRoutes);
router.use('/timeline', timelineRoutes);
router.use('/mood', moodRoutes);
router.use('/dates', dateRoutes);

export default router;

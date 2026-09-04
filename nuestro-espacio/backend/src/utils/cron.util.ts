import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

let capsuleCheckInterval: NodeJS.Timeout | null = null;

/**
 * Initialize cron jobs for time capsules
 * Checks every hour (configurable) for capsules ready to reveal
 */
export const initCapsuleCron = (
  prisma: PrismaClient,
  io: SocketIOServer | null
): void => {
  const intervalMs = parseInt(process.env.CAPSULE_CHECK_INTERVAL || '3600000', 10);
  
  logger.info(`Time Capsule cron initialized with ${intervalMs / 1000}s interval`);

  // Run immediately on startup
  checkRevealedCapsules(prisma, io);

  // Then run at regular intervals
  capsuleCheckInterval = setInterval(() => {
    checkRevealedCapsules(prisma, io);
  }, intervalMs);
};

/**
 * Check for capsules that should be revealed
 * Updates their status and notifies receivers
 */
const checkRevealedCapsules = async (
  prisma: PrismaClient,
  io: SocketIOServer | null
): Promise<void> => {
  try {
    const now = new Date();

    // Find all unrevealed capsules whose reveal date has passed
    const capsulesToReveal = await prisma.capsule.findMany({
      where: {
        isRevealed: false,
        revealDate: {
          lte: now
        }
      },
      include: {
        receiver: {
          select: {
            id: true,
            email: true,
            displayName: true
          }
        },
        sender: {
          select: {
            id: true,
            displayName: true
          }
        }
      }
    });

    if (capsulesToReveal.length === 0) {
      return;
    }

    logger.info(`Found ${capsulesToReveal.length} capsules to reveal`);

    // Update each capsule
    const updatePromises = capsulesToReveal.map(async (capsule) => {
      await prisma.capsule.update({
        where: { id: capsule.id },
        data: {
          isRevealed: true,
          revealedAt: now
        }
      });

      // Notify receiver via socket
      if (io) {
        io.to(`user:${capsule.receiverId}`).emit('capsule:revealed', {
          capsuleId: capsule.id,
          title: capsule.title,
          senderName: capsule.sender.displayName || 'Someone special',
          revealedAt: now.toISOString()
        });

        // Also send push notification (to be implemented with local notifications)
        await prisma.notification.create({
          data: {
            userId: capsule.receiverId,
            title: '🎉 ¡Cápsula del Tiempo Revelada!',
            message: `${capsule.sender.displayName || 'Alguien'} te envió una cápsula: ${capsule.title}`,
            type: 'capsule',
            relatedEntityType: 'Capsule',
            relatedEntityId: capsule.id
          }
        });
      }

      logger.info(`Capsule ${capsule.id} revealed for user ${capsule.receiverId}`);
    });

    await Promise.all(updatePromises);

  } catch (error) {
    logger.error('Error checking revealed capsules', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Stop the cron job (for graceful shutdown)
 */
export const stopCapsuleCron = (): void => {
  if (capsuleCheckInterval) {
    clearInterval(capsuleCheckInterval);
    capsuleCheckInterval = null;
    logger.info('Time Capsule cron stopped');
  }
};

export default initCapsuleCron;

import confetti from 'canvas-confetti';

/**
 * Triggers an energetic multi-burst sparkle and confetti celebration
 * when candidate registration succeeds.
 */
export function triggerRegistrationSparkles(): void {
  try {
    // 1. Center burst of stars and shapes
    confetti({
      particleCount: 90,
      spread: 80,
      origin: { y: 0.55 },
      colors: ['#6366f1', '#4f46e5', '#818cf8', '#a855f7', '#ec4899', '#f59e0b', '#10b981'],
      shapes: ['star', 'circle'],
      ticks: 200,
      gravity: 0.8,
      scalar: 1.1,
    });

    // 2. Left and right celebration cannons after a tiny offset
    setTimeout(() => {
      confetti({
        particleCount: 60,
        angle: 60,
        spread: 65,
        origin: { x: 0.1, y: 0.65 },
        colors: ['#4f46e5', '#6366f1', '#38bdf8', '#fbbf24', '#f43f5e'],
        shapes: ['star', 'circle'],
      });
      confetti({
        particleCount: 60,
        angle: 120,
        spread: 65,
        origin: { x: 0.9, y: 0.65 },
        colors: ['#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ec4899'],
        shapes: ['star', 'circle'],
      });
    }, 150);

    // 3. Gentle golden star rain
    setTimeout(() => {
      confetti({
        particleCount: 45,
        spread: 120,
        origin: { y: 0.3 },
        colors: ['#fbbf24', '#f59e0b', '#a855f7', '#6366f1'],
        shapes: ['star'],
        gravity: 0.6,
        scalar: 1.2,
      });
    }, 350);
  } catch (err) {
    console.warn('Confetti sparkles could not run:', err);
  }
}

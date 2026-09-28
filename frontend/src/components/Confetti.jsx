import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#6C5CE7', '#00B894', '#FDCB6E', '#FF7675', '#A29BFE'],
  });
};

export const triggerVictoryConfetti = () => {
  const end = Date.now() + 2.5 * 1000;
  const colors = ['#6C5CE7', '#00B894', '#FDCB6E', '#FF7675', '#A29BFE'];

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
};

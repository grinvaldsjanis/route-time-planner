import React, { useEffect, useRef } from "react";

const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth - 100);
    let height = (canvas.height = window.innerHeight - 200);

    // Speed range customization
    const maxSpeed = 4;
    const minSpeed = 0.1;

    // Parameters for responsiveness
    const getSettings = () => {
      if (window.matchMedia("(max-width: 480px)").matches) {
        return { pointCount: 10, lineWidth: 1, pointRadius: 2 };
      } else if (window.matchMedia("(max-width: 768px)").matches) {
        return { pointCount: 30, lineWidth: 2, pointRadius: 4 };
      } else {
        return { pointCount: 50, lineWidth: 3, pointRadius: 6 };
      }
    };

    let { pointCount, lineWidth, pointRadius } = getSettings();

    let points: { x: number; y: number; dx: number; dy: number }[] = [];

    // Initialize points
    const initializePoints = () => {
      points = [];
      for (let i = 0; i < pointCount; i++) {
        points.push({
          x: Math.random() * (width - 2 * pointRadius) + pointRadius,
          y: Math.random() * (height - 2 * pointRadius) + pointRadius,
          dx: (Math.random() - 0.5) * maxSpeed,
          dy: (Math.random() - 0.5) * maxSpeed,
        });
      }
    };

    // Calculate alpha based on line length
    const calculateAlpha = (length: number, maxLength: number): number => {
      return 0.7 - length / maxLength; // Shorter lines = higher alpha
    };

    // Calculate speed factor based on distance from center
    const calculateSpeedFactor = (x: number, y: number): number => {
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2); // Distance from center to corner
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2); // Distance from point to center

      // Map distance to speed (closer to center = faster)
      return minSpeed + (1 - distance / maxDistance) * (maxSpeed - minSpeed);
    };

    // Draw frame
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const maxLength = Math.min(width, height); // Max length for lines

      // Draw lines between points
      points.forEach((p, i) => {
        const next = points[(i + 1) % points.length];
        const length = Math.sqrt((next.x - p.x) ** 2 + (next.y - p.y) ** 2);
        const alpha = calculateAlpha(length, maxLength);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = `rgba(0, 123, 255, ${alpha.toFixed(2)})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      });

      // Draw points
      points.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pointRadius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 123, 255, 0.5)";
        ctx.fill();

        // Calculate speed factor dynamically
        const speedFactor = calculateSpeedFactor(p.x, p.y);

        // Normalize the direction of movement to maintain consistent angles
        const magnitude = Math.sqrt(p.dx ** 2 + p.dy ** 2);
        p.dx = (p.dx / magnitude) * speedFactor;
        p.dy = (p.dy / magnitude) * speedFactor;

        // Update positions
        p.x += p.dx;
        p.y += p.dy;

        // Bounce on edges considering radius
        if (p.x - pointRadius < 0 || p.x + pointRadius > width) p.dx *= -1;
        if (p.y - pointRadius < 0 || p.y + pointRadius > height) p.dy *= -1;
      });
    };

    const animate = () => {
      draw();
      requestAnimationFrame(animate);
    };

    // Handle window resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth - 100;
      height = canvas.height = window.innerHeight - 200;

      // Update settings on resize
      ({ pointCount, lineWidth, pointRadius } = getSettings());
      initializePoints();
    };

    // Initialize
    initializePoints();
    animate();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 20,
        left: 50,
        zIndex: -1,
      }}
    />
  );
};

export default AnimatedBackground;
